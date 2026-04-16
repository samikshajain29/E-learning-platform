import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded admin credentials as per requirements
    if (email === "admin@gmail.com" && password === "admin123456") {
      const token = jwt.sign(
        { email, role: "admin" },
        process.env.JWT_SECRET || "default_secret_key", // Fallback for dev if needed
        { expiresIn: "10h" }
      );
      
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: { email, role: "admin" }
      });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error during admin login" });
  }
};

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const users = await User.find({}).populate("enrollmentDates.course");
    const courses = await Course.find({});

    const totalUsers = users.filter((u) => u.role === "student").length;
    const totalEducators = users.filter((u) => u.role === "educator").length;
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === "ongoing" || c.isPublished).length;

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayEnrollments = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    users.forEach((user) => {
      user.enrollmentDates.forEach((enrollment) => {
        if (!enrollment.course) return; // if course population failed or course deleted

        const coursePrice = enrollment.course.price || 0;
        totalRevenue += coursePrice;

        const enrollmentDate = new Date(enrollment.enrolledAt);
        enrollmentDate.setHours(0, 0, 0, 0);

        if (enrollmentDate.getTime() === today.getTime()) {
          todayEnrollments += 1;
          todayRevenue += coursePrice;
        }
      });
    });

    return res.status(200).json({
      totalUsers,
      totalEducators,
      totalCourses,
      activeCourses,
      todayEnrollments,
      todayRevenue,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

// @desc    Get analytics for graphs
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    const users = await User.find({}).populate("enrollmentDates.course");
    
    // Generate an array of the last 30 days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last30Days.push({
        date: date.toISOString().split("T")[0],
        dailyEnrollments: 0,
        dailyRevenue: 0,
        timestamp: date.getTime(),
      });
    }

    users.forEach((user) => {
      user.enrollmentDates.forEach((enrollment) => {
        if (!enrollment.course) return;

        const enrollmentDate = new Date(enrollment.enrolledAt);
        enrollmentDate.setHours(0, 0, 0, 0);
        const enrollmentTime = enrollmentDate.getTime();
        const coursePrice = enrollment.course.price || 0;

        const dayRecord = last30Days.find((day) => day.timestamp === enrollmentTime);
        if (dayRecord) {
          dayRecord.dailyEnrollments += 1;
          dayRecord.dailyRevenue += coursePrice;
        }
      });
    });

    // Remove the temporary timestamp field before returning to frontend
    const formattedData = last30Days.map((day) => ({
      date: day.date,
      dailyEnrollments: day.dailyEnrollments,
      dailyRevenue: day.dailyRevenue,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    return res.status(500).json({ message: "Server error fetching analytics" });
  }
};
