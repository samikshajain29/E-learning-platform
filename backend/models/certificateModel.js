import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
    {
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
        certificateId: {
            type: String,
            required: true,
            unique: true,
        },
        studentName: {
            type: String,
            required: true,
        },
        courseTitle: {
            type: String,
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
        percentage: {
            type: Number,
            required: true,
        },
        issuedDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Ensure one certificate per student per course
certificateSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
