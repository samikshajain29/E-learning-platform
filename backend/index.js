import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log("server started");
  connectDB();
});
