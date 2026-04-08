import express from "express";
import { getStudentDetails } from "../controllers/studentController.js";
import isAuth from "../middlewares/isAuth.js";

const studentRouter = express.Router();

studentRouter.get("/:id/details", isAuth, getStudentDetails);

export default studentRouter;
