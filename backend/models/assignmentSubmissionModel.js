import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        selectedOption: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const assignmentSubmissionSchema = new mongoose.Schema(
    {
        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        answers: {
            type: [answerSchema],
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
            default: 10,
        },
    },
    { timestamps: true }
);

// Prevent duplicate submissions (one attempt per student per course)
assignmentSubmissionSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
export default AssignmentSubmission;
