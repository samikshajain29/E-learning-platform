import mongoose from "mongoose";

const educatorRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    subjects: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    portfolio: {
      type: String,
    },
    idProof: {
      type: String, // URL from cloudinary
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const EducatorRequest = mongoose.model("EducatorRequest", educatorRequestSchema);

export default EducatorRequest;
