import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAnalytics,
  getPendingEducatorRequests,
  getEducatorRequestDetails,
  updateEducatorRequestStatus
} from "../controllers/adminController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/dashboard-stats", adminAuth, getDashboardStats);
router.get("/analytics", adminAuth, getAnalytics);

// Educator Request routes
router.get("/educator-requests", adminAuth, getPendingEducatorRequests);
router.get("/educator-request/:id", adminAuth, getEducatorRequestDetails);
router.patch("/educator-request/:id", adminAuth, updateEducatorRequestStatus);

export default router;
