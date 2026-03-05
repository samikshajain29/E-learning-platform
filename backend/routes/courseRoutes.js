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
import upload from "../middlewares/multer.js";
import { searchWithAi } from "../controllers/searchController.js";

const courseRouter = express.Router();

courseRouter.post("/create", isAuth, createCourse);
courseRouter.get("/getpublished", getPublishedCourses);
courseRouter.get("/getcreator", isAuth, getCreatorCourses);
courseRouter.get("/getcreator/:educatorId", getCoursesByEducatorId); // NEW: Public endpoint for educator profiles
courseRouter.get("/dashboard-stats", isAuth, getDashboardStats);
courseRouter.get("/student-progress/:courseId", isAuth, getStudentProgress);
courseRouter.post(
  "/editcourse/:courseId",
  isAuth,
  upload.single("thumbnail"),
  editCourse
);
courseRouter.get("/getcourse/:courseId", isAuth, getCourseById);
courseRouter.delete("/remove/:courseId", isAuth, removeCourse);

//for lectures

courseRouter.post("/createlecture/:courseId", isAuth, createLecture);
courseRouter.get("/courselecture/:courseId", isAuth, getCourseLecture);
courseRouter.post(
  "/editlecture/:lectureId",
  isAuth,
  upload.single("videoUrl"),
  editLecture
);
courseRouter.delete("/removelecture/:lectureId", isAuth, removeLecture);
courseRouter.post("/creator", isAuth, getCreatorById);

//for search
courseRouter.post("/search", searchWithAi);

// NEW: Update course status (only creator can update)
courseRouter.put("/status/:courseId", isAuth, updateCourseStatus);

// NEW: Assignment routes
courseRouter.post("/assignment/:courseId", isAuth, uploadAssignment);
courseRouter.get("/assignment/:courseId", getAssignmentByCourseId);

// NEW: Assignment submission routes
courseRouter.post("/assignment/submit/:courseId", isAuth, submitAssignment);
courseRouter.get("/assignment/submission-status/:courseId", isAuth, getSubmissionStatus);

export default courseRouter;
