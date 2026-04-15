import express from "express";
import { applyEducator } from "../controllers/educatorRequestController.js";
import { isAuth } from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post(
  "/apply",
  isAuth,
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  applyEducator
);

export default router;
