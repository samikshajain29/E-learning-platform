import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createReview, getReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/createreview", isAuth, createReview);
reviewRouter.get("/getreview", getReviews);

export default reviewRouter;
