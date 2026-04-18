import express from "express";
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getCourseById,
  getCourseLecture,
  getCreatorById,
  getCreatorCourses,
  getDashboardStats,
  getStudentProgress,
  getPublishedCourses,
  removeCourse,
  removeLecture,
  getCoursesByEducatorId, // NEW: Added for public educator profile viewing
  updateCourseStatus, // NEW: Added for course status update
} from "../controllers/courseControllers.js";
import { uploadAssignment, getAssignmentByCourseId } from "../controllers/assignmentController.js";
import { submitAssignment, getSubmissionStatus } from "../controllers/assignmentSubmissionController.js";
import isAuth from "../middlewares/isAuth.js";
import isEducator from "../middlewares/isEducator.js";
import upload from "../middlewares/multer.js";
import { searchWithAi } from "../controllers/searchController.js";

const courseRouter = express.Router();

courseRouter.post("/create", isEducator, createCourse);
courseRouter.get("/getpublished", getPublishedCourses);
courseRouter.get("/getcreator", isEducator, getCreatorCourses);
courseRouter.get("/getcreator/:educatorId", getCoursesByEducatorId); // NEW: Public endpoint for educator profiles
courseRouter.get("/dashboard-stats", isEducator, getDashboardStats);
courseRouter.get("/student-progress/:courseId", isEducator, getStudentProgress);
courseRouter.post(
  "/editcourse/:courseId",
  isEducator,
  upload.single("thumbnail"),
  editCourse
);
courseRouter.get("/getcourse/:courseId", isAuth, getCourseById);
courseRouter.delete("/remove/:courseId", isEducator, removeCourse);

//for lectures

courseRouter.post("/createlecture/:courseId", isEducator, createLecture);
courseRouter.get("/courselecture/:courseId", isAuth, getCourseLecture); // students need to get lectures too
courseRouter.post(
  "/editlecture/:lectureId",
  isEducator,
  upload.single("videoUrl"),
  editLecture
);
courseRouter.delete("/removelecture/:lectureId", isEducator, removeLecture);
courseRouter.post("/creator", isEducator, getCreatorById);

//for search
courseRouter.post("/search", searchWithAi);

// NEW: Update course status (only creator can update)
courseRouter.put("/status/:courseId", isEducator, updateCourseStatus);

// NEW: Assignment routes
courseRouter.post("/assignment/:courseId", isEducator, uploadAssignment);
courseRouter.get("/assignment/:courseId", isAuth, getAssignmentByCourseId);

// NEW: Assignment submission routes
courseRouter.post("/assignment/submit/:courseId", isAuth, submitAssignment);
courseRouter.get("/assignment/submission-status/:courseId", isAuth, getSubmissionStatus);

export default courseRouter;
