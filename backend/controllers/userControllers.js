import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "educator" && !user.hasAppliedForEducator) {
      const hasCourses = await Course.exists({ creator: user._id });
      if (hasCourses) {
        user.hasAppliedForEducator = true;
        await user.save();
      }
    }
    
    let educatorStatus = "none";
    if (user.hasAppliedForEducator) {
      const EducatorRequest = (await import("../models/educatorRequestModel.js")).default;
      const existingRequest = await EducatorRequest.findOne({ userId: req.userId });
      if (existingRequest) {
        educatorStatus = existingRequest.status;
      } else if (user.role === "educator") {
        educatorStatus = "approved"; // legacy edge-case 
      }
    }

    const userObj = user.toObject();
    userObj.educatorStatus = educatorStatus;

    return res.status(200).json(userObj);
  } catch (error) {
    return res.status(500).json({ message: `getCurrentUser error ${error}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { description, name } = req.body;
    let photoUrl;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }
    const user = await User.findByIdAndUpdate(userId, {
      name,
      description,
      photoUrl,
    });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `updateProfile error ${error}` });
  }
};
