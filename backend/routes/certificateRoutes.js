import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    generateCertificate,
    checkCertificateEligibility
} from "../controllers/certificateController.js";

const certificateRouter = express.Router();

// Generate and download certificate
certificateRouter.get("/:courseId", isAuth, generateCertificate);

// Check eligibility for certificate
certificateRouter.get("/eligibility/:courseId", isAuth, checkCertificateEligibility);

export default certificateRouter;
