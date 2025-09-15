import express from "express";
import {
  googleAuth,
  login,
  logout,
  resetPassword,
  sendOTP,
  signup,
  verifyOTP,
} from "../controllers/authControllers.js";

const authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/sendotp", sendOTP);
authRouter.post("/verifyotp", verifyOTP);
authRouter.post("/resetpassword", resetPassword);
authRouter.post("/googleauth", googleAuth);

export default authRouter;
