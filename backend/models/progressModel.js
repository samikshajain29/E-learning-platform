import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        watchedPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

// Prevent duplicate progress entries for same user + lecture
progressSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;