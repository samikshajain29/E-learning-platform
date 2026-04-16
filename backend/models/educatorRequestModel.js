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
      unique: true,
    },
    currentRole: {
      type: String, // optional
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
      type: String, // comma separated
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
    idProofUrl: {
      type: String, // URL from cloudinary
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
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
