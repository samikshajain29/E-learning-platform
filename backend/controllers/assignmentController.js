import Assignment from "../models/assignmentModel.js";
import Course from "../models/courseModel.js";

// Upload assignment for a course
export const uploadAssignment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { questions } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: "Questions array is required" });
        }

        // Validate exactly 10 questions
        if (questions.length !== 10) {
            return res.status(400).json({ message: "Assignment must contain exactly 10 questions" });
        }

        // Validate each question has exactly 4 options and a correct answer
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have a question text and exactly 4 options`
                });
            }
            if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
                return res.status(400).json({
                    message: `Question ${i + 1} must have a correct answer that matches one of the options`
                });
            }
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if user is the course creator
        if (course.creator.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the course creator can upload assignments" });
        }

        // Check if course status is completed (NEW REQUIREMENT)
        if (course.status !== "completed") {
            return res.status(400).json({ message: "Assignments can only be uploaded for completed courses. Please mark the course as completed first." });
        }

        // Check if assignment already exists for this course
        const existingAssignment = await Assignment.findOne({ courseId });
        if (existingAssignment) {
            return res.status(400).json({ message: "Assignment already exists for this course. Only one assignment per course is allowed." });
        }

        // Create and save assignment
        const assignment = new Assignment({
            courseId,
            createdBy: userId,
            questions,
        });

        await assignment.save();

        return res.status(201).json({
            message: "Assignment uploaded successfully",
            assignment,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to upload assignment: ${error.message}`,
        });
    }
};

// Get assignment by courseId
export const getAssignmentByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find assignment for this course
        const assignment = await Assignment.findOne({ courseId })
            .populate("createdBy", "name email photoUrl");

        if (!assignment) {
            return res.status(404).json({ message: "No assignment found for this course" });
        }

        return res.status(200).json({
            assignment,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to get assignment: ${error.message}`,
        });
    }
};
