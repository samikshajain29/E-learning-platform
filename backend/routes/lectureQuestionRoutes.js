import express from "express";
import {
  addQuestion,
  getQuestionsByLecture,
  replyToQuestion
} from "../controllers/lectureQuestionController.js";
import isAuth from "../middlewares/isAuth.js";

const lectureQuestionRouter = express.Router();

// Add a question to a lecture
lectureQuestionRouter.post("/questions", isAuth, addQuestion);

// Get all questions for a specific lecture
lectureQuestionRouter.get("/questions/:lectureId", getQuestionsByLecture);

// Reply to a question (only course creator)
lectureQuestionRouter.put("/questions/reply/:questionId", isAuth, replyToQuestion);

export default lectureQuestionRouter;