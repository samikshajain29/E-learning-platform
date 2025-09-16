import express from "express";
import {
  getCurrentUser,
  updateProfile,
} from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/getcurrentuser", isAuth, getCurrentUser);
userRouter.post(
  "/updateprofile",
  isAuth,
  upload.single("photoUrl"),
  updateProfile
);

export default userRouter;
