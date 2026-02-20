import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
dotenv.config();
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import reviewRouter from "./routes/reviewRoute.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import progressRouter from "./routes/progressRoutes.js";
import lectureQuestionRouter from "./routes/lectureQuestionRoutes.js";

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/order", paymentRouter);
app.use("/api/review", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/progress", progressRouter);
app.use("/api/lecture-question", lectureQuestionRouter);

connectDB();

console.log(`Attempting to listen on port ${port}`);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
