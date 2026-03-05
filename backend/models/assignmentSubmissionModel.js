import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        questionIndex: {
            type: Number,
            required: true,
        },
        questionText: {
            type: String,
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
        totalMarks: {
            type: Number,
            required: true,
            default: 100,
        },
    },
    { timestamps: true }
);

// Prevent duplicate submissions (one attempt per student per assignment)
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
export default AssignmentSubmission;
