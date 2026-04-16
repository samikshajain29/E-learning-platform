import EducatorRequest from "../models/educatorRequestModel.js";
import User from "../models/userModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";

// @desc    Submit an educator request
// @route   POST /api/educator/apply
// @access  Private
export const applyEducator = async (req, res) => {
  try {
    const { name, email, contact, currentRole, qualification, experience, skills, subjects, bio } = req.body;

    // Check if a request already exists for this user
    const existingRequest = await EducatorRequest.findOne({ userId: req.userId });

    // Check if contact already exists
    const existingContact = await EducatorRequest.findOne({ contact });

    if (existingRequest || existingContact) {
      // Clean up uploaded files if request rejected
      if (req.files) {
         Object.values(req.files).forEach((files) => {
           files.forEach((file) => {
             import("fs").then(fs => {
               if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
             }).catch(console.error);
           });
         });
      }
      if (existingRequest) {
        return res.status(400).json({ message: `You already have a ${existingRequest.status} request submitted.` });
      }
      if (existingContact) {
        return res.status(400).json({ message: "This contact number is already in use" });
      }
    }

    if (!req.files || !req.files.idProof || req.files.idProof.length === 0 || !req.files.resume || req.files.resume.length === 0 || !req.files.profileImage || req.files.profileImage.length === 0) {
      if (req.files) {
         Object.values(req.files).forEach((files) => {
           files.forEach((file) => {
             import("fs").then(fs => {
               if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
             }).catch(console.error);
           });
         });
      }
      return res.status(400).json({ message: "ID Proof, Resume, and Profile Picture are required" });
    }

    // Upload ID Proof to Cloudinary
    const idProofUrl = await uploadOnCloudinary(req.files.idProof[0].path);
    if (!idProofUrl) {
      return res.status(500).json({ message: "Failed to upload ID proof" });
    }

    const resumeUrl = await uploadOnCloudinary(req.files.resume[0].path);
    if (!resumeUrl) {
      return res.status(500).json({ message: "Failed to upload Resume" });
    }

    const profileImageUrl = await uploadOnCloudinary(req.files.profileImage[0].path);
    if (!profileImageUrl) {
      return res.status(500).json({ message: "Failed to upload Profile Picture" });
    }

    // Create the request
    const newRequest = await EducatorRequest.create({
      userId: req.userId,
      name,
      email,
      contact,
      currentRole,
      qualification,
      experience: Number(experience),
      skills,
      subjects,
      bio,
      idProofUrl,
      resumeUrl,
      profileImageUrl,
    });

    await User.findByIdAndUpdate(req.userId, { hasAppliedForEducator: true });

    res.status(201).json({
      message: "Your educator application has been submitted successfully and is under review.",
      request: newRequest,
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((files) => {
           files.forEach((file) => {
             import("fs").then(fs => {
               if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
             }).catch(console.error);
           });
       });
    }
    console.error("Apply Educator Error:", error);
    res.status(500).json({ message: "Server error occurred while submitting." });
  }
};

// @desc    Get status of an educator request
// @route   GET /api/educator/status
// @access  Private
export const getEducatorStatus = async (req, res) => {
  try {
    const existingRequest = await EducatorRequest.findOne({ userId: req.userId });
    if (existingRequest) {
      return res.status(200).json({ status: existingRequest.status });
    }
    return res.status(200).json({ status: "none" });
  } catch (error) {
    console.error("Get Educator Status Error:", error);
    res.status(500).json({ message: "Server error occurred while checking status." });
  }
};
