import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    updateLectureProgress,
    getEducatorProgressStats,
    getLectureProgress,
    getCourseCompletionStatus
} from "../controllers/progressController.js";

const progressRouter = express.Router();

// All routes require authentication
progressRouter.use(isAuth);

// Update lecture progress (students only - but educators can call too)
progressRouter.post("/update", updateLectureProgress);

// Get educator dashboard progress statistics for a course
progressRouter.get("/educator/:courseId", getEducatorProgressStats);

// Get specific lecture progress (optional)
progressRouter.get("/lecture", getLectureProgress);

// Get course completion status for student
progressRouter.get("/course/:courseId", getCourseCompletionStatus);

export default progressRouter;