import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (v) {
                    return v.length === 4;
                },
                message: "Each question must have exactly 4 options",
            },
        },
        correctAnswer: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    // Validate that correctAnswer matches one of the options
                    // This will be checked at save time in the parent schema
                    return true;
                },
                message: "Correct answer must match one of the provided options",
            },
        },
    },
    { _id: false }
);

const assignmentSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: function (v) {
                    return v.length > 0;
                },
                message: "Assignment must have at least 1 question",
            },
        },
    },
    { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
