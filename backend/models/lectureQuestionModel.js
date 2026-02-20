import mongoose from "mongoose";

const lectureQuestionSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    replyCreatedAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

const LectureQuestion = mongoose.model("LectureQuestion", lectureQuestionSchema);
export default LectureQuestion;