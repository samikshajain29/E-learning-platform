import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAnalytics,
} from "../controllers/adminController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/dashboard-stats", adminAuth, getDashboardStats);
router.get("/analytics", adminAuth, getAnalytics);

export default router;
