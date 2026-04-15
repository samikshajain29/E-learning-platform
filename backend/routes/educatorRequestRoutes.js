import express from "express";
import { applyEducator } from "../controllers/educatorRequestController.js";
import { isAuth } from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/", isAuth, upload.single("idProof"), applyEducator);

export default router;
