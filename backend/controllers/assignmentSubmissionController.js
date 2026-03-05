import Assignment from "../models/assignmentModel.js";
import AssignmentSubmission from "../models/assignmentSubmissionModel.js";
import Course from "../models/courseModel.js";

// Submit assignment attempt (for students)
export const submitAssignment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { answers } = req.body;
        const studentId = req.userId;

        // Validate required fields
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers array is required" });
        }

        // Verify assignment exists for this course
        const assignment = await Assignment.findOne({ courseId });
        if (!assignment) {
            return res.status(404).json({ message: "No assignment found for this course" });
        }

        // Check if student has already submitted
        const existingSubmission = await AssignmentSubmission.findOne({
            courseId,
            studentId
        });
        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this assignment" });
        }

        // Validate answers count
        if (answers.length !== assignment.questions.length) {
            return res.status(400).json({ message: `Please answer all ${assignment.questions.length} questions` });
        }

        // Calculate score
        let score = 0;
        const formattedAnswers = answers.map((answer) => {
            const question = assignment.questions.id(answer.questionId);
            if (question && question.correctAnswer === answer.selectedOption) {
                score++;
            }
            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
            };
        });

        // Create submission
        const submission = new AssignmentSubmission({
            assignmentId: assignment._id,
            courseId,
            studentId,
            answers: formattedAnswers,
            score,
            totalQuestions: assignment.questions.length,
        });

        await submission.save();

        return res.status(201).json({
            message: "Assignment submitted successfully",
            score,
            totalQuestions: assignment.questions.length,
            percentage: ((score / assignment.questions.length) * 100).toFixed(2),
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to submit assignment: ${error.message}`,
        });
    }
};

// Get student's assignment submission status and score
export const getSubmissionStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.userId;

        const submission = await AssignmentSubmission.findOne({
            courseId,
            studentId
        });

        if (!submission) {
            return res.status(404).json({ message: "No submission found" });
        }

        return res.status(200).json({
            submitted: true,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            percentage: ((submission.score / submission.totalQuestions) * 100).toFixed(2),
            submittedAt: submission.createdAt,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to get submission status: ${error.message}`,
        });
    }
};
