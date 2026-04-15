import EducatorRequest from "../models/educatorRequestModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";

// @desc    Submit an educator request
// @route   POST /api/educator-request
// @access  Private
export const applyEducator = async (req, res) => {
  try {
    const { name, email, contact, qualification, experience, skills, subjects, bio, reason, portfolio } = req.body;

    // Check if a request already exists for this user
    const existingRequest = await EducatorRequest.findOne({ userId: req.user._id });

    if (existingRequest) {
      if (req.file) {
        // clean up uploaded file if request rejected
        import("fs").then(fs => fs.unlinkSync(req.file.path)).catch(console.error);
      }
      return res.status(400).json({ message: `You already have a ${existingRequest.status} request submitted.` });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ID Proof is required" });
    }

    // Upload ID Proof to Cloudinary
    const idProofUrl = await uploadOnCloudinary(req.file.path);

    if (!idProofUrl) {
      return res.status(500).json({ message: "Failed to upload ID proof" });
    }

    // Create the request
    const newRequest = await EducatorRequest.create({
      userId: req.user._id,
      name,
      email,
      contact,
      qualification,
      experience: Number(experience),
      skills,
      subjects,
      bio,
      reason,
      portfolio,
      idProof: idProofUrl,
    });

    res.status(201).json({
      message: "Your application has been submitted successfully.",
      request: newRequest,
    });
  } catch (error) {
    if (req.file) {
      import("fs").then(fs => {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      }).catch(console.error);
    }
    console.error("Apply Educator Error:", error);
    res.status(500).json({ message: "Server error occurred while submitting." });
  }
};
