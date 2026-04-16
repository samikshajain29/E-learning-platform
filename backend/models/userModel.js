import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "educator"],
      required: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    hasAppliedForEducator: {
      type: Boolean,
      default: false,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    enrollmentDates: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        enrolledAt: { type: Date, default: Date.now }
      }
    ],
    courseProgress: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        completedLectures: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
          },
        ],
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    education: {
      type: String,
    },
    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
