import User from "../models/userModel.js";
import validator from "validator";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User is already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter Valid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Enter Strong password" });
    }
  } catch (error) {}
};
