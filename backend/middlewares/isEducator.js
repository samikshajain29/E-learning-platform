import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Ensure the module import returns the actual model due to dynamic ESM load limits in middleware execution context if necessary, but static works here:
import EducatorRequest from "../models/educatorRequestModel.js";

export const isEducator = async (req, res, next) => {
  try {
    let { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "User doesn't have a token" });
    }
    
    let verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(401).json({ message: "User doesn't have a valid token" });
    }
    
    // Check if user exists and has educator role
    const user = await User.findById(verifyToken.userId);
    if (!user || user.role !== "educator") {
      return res.status(403).json({ message: "Access denied. Action strictly restricted to educators." });
    }

    // Check strict Educator Request validation state
    const requestData = await EducatorRequest.findOne({ userId: user._id });
    
    if (requestData) {
      // Modern educator flow -> verify they are approved
      if (requestData.status !== "approved") {
        return res.status(403).json({ message: "Access denied. Your educator status is strictly pending or rejected." });
      }
    } else if (!user.hasAppliedForEducator) {
      // Not legacy auto-verified, and no active application exists -> restrict
      return res.status(403).json({ message: "Access denied. Educator status is strictly unresolved." });
    }
    
    // Legacy mapping explicitly clears the gate if hasAppliedForEducator flag is true but there's no struct Request yet
    
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: `isEducator security proxy error: ${error}` });
  }
};

export default isEducator;
