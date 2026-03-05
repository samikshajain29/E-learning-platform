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
            assignmentId: assignment._id,
            studentId
        });
        if (existingSubmission) {
            return res.status(400).json({
                message: "You have already attempted the assignment.",
                previousScore: existingSubmission.score,
                totalMarks: existingSubmission.totalMarks
            });
        }

        // Validate answers count - must answer all questions
        if (answers.length !== assignment.questions.length) {
            return res.status(400).json({
                message: `Please answer all ${assignment.questions.length} questions. You have answered ${answers.length} questions.`
            });
        }

        // Validate each answer has questionIndex and selectedOption
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            if (answer.questionIndex === undefined || !answer.selectedOption) {
                return res.status(400).json({
                    message: `Answer ${i + 1} is missing question index or selected option`
                });
            }
        }

        // Calculate score (each question = 10 marks, total = 100)
        let correctAnswers = 0;
        const formattedAnswers = answers.map((answer) => {
            // Get the question from assignment using the index
            const question = assignment.questions[answer.questionIndex];
            if (question && question.correctAnswer === answer.selectedOption) {
                correctAnswers++;
            }
            return {
                questionIndex: answer.questionIndex,
                questionText: answer.questionText || (question ? question.question : ''),
                selectedOption: answer.selectedOption,
            };
        });

        // Each question = 10 marks, total = 100
        const score = correctAnswers * 10;
        const totalMarks = 100;

        // Create submission
        const submission = new AssignmentSubmission({
            assignmentId: assignment._id,
            courseId,
            studentId,
            answers: formattedAnswers,
            score,
            totalMarks,
        });

        await submission.save();

        return res.status(201).json({
            message: "Assignment submitted successfully",
            score,
            totalMarks,
            percentage: ((score / totalMarks) * 100).toFixed(2),
        });
    } catch (error) {
        console.error("Assignment submission error:", error);
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

        // Find assignment for this course
        const assignment = await Assignment.findOne({ courseId });
        if (!assignment) {
            return res.status(404).json({ message: "No assignment found for this course" });
        }

        const submission = await AssignmentSubmission.findOne({
            assignmentId: assignment._id,
            studentId
        });

        if (!submission) {
            return res.status(404).json({ message: "No submission found" });
        }

        return res.status(200).json({
            submitted: true,
            score: submission.score,
            totalMarks: submission.totalMarks,
            percentage: ((submission.score / submission.totalMarks) * 100).toFixed(2),
            submittedAt: submission.createdAt,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to get submission status: ${error.message}`,
        });
    }
};
