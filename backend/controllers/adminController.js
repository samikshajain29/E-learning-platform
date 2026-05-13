import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import EducatorRequest from "../models/educatorRequestModel.js";

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
    // --- User & Educator counts ---
    const totalUsers = await User.countDocuments({ role: "student" });

    // Count only approved educators:
    // 1. Users who have an approved EducatorRequest
    const approvedRequestCount = await EducatorRequest.countDocuments({ status: "approved" });
    // 2. Legacy educators (role=educator but no EducatorRequest entry — pre-existing approved educators)
    const educatorUsers = await User.find({ role: "educator" }).select("_id");
    const educatorUserIds = educatorUsers.map((u) => u._id);
    const educatorsWithRequests = await EducatorRequest.find({ userId: { $in: educatorUserIds } }).select("userId");
    const educatorIdsWithRequest = new Set(educatorsWithRequests.map((r) => r.userId.toString()));
    const legacyEducatorCount = educatorUserIds.filter((id) => !educatorIdsWithRequest.has(id.toString())).length;
    const totalEducators = approvedRequestCount + legacyEducatorCount;

    // --- Course counts ---
    const courses = await Course.find({}).select("status isPublished");
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === "ongoing" || c.isPublished).length;

    // --- Total Revenue (all educators combined) ---
    // Aggregate from Course collection: sum(price × enrolledStudents count)
    // This captures every successful enrollment including legacy ones that may
    // not have an enrollmentDates entry, and matches educator earnings logic.
    const revenueResult = await Course.aggregate([
      {
        $project: {
          price: { $ifNull: ["$price", 0] },
          enrolledCount: { $size: { $ifNull: ["$enrolledStudents", []] } },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$enrolledCount"] } },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // --- Today's enrollments & revenue ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await User.aggregate([
      { $unwind: "$enrollmentDates" },
      { $match: { "enrollmentDates.enrolledAt": { $gte: today } } },
      {
        $lookup: {
          from: "courses",
          localField: "enrollmentDates.course",
          foreignField: "_id",
          as: "courseData",
        },
      },
      { $unwind: { path: "$courseData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          todayEnrollments: { $sum: 1 },
          todayRevenue: { $sum: { $ifNull: ["$courseData.price", 0] } },
        },
      },
    ]);

    const todayEnrollments = todayStats.length > 0 ? todayStats[0].todayEnrollments : 0;
    const todayRevenue = todayStats.length > 0 ? todayStats[0].todayRevenue : 0;

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

// @desc    Get pending educator requests
// @route   GET /api/admin/educator-requests
// @access  Private (Admin only)
export const getPendingEducatorRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filterStatus = status || "pending";
    
    const requests = await EducatorRequest.find({ status: filterStatus }).sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching educator requests:", error);
    return res.status(500).json({ message: "Server error fetching educator requests" });
  }
};

// @desc    Get details of a specific educator request
// @route   GET /api/admin/educator-request/:id
// @access  Private (Admin only)
export const getEducatorRequestDetails = async (req, res) => {
  try {
    const request = await EducatorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Educator request not found" });
    }
    return res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching educator request details:", error);
    return res.status(500).json({ message: "Server error fetching request details" });
  }
};

// @desc    Update educator request status (approve/reject)
// @route   PATCH /api/admin/educator-request/:id
// @access  Private (Admin only)
export const updateEducatorRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await EducatorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Educator request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    const updatedRequest = await EducatorRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // If approved, update the user role to educator
    if (status === "approved") {
      await User.findByIdAndUpdate(request.userId, { 
        role: "educator",
      });
    }

    // Compute updated approved educator count for real-time frontend update
    const approvedRequestCount = await EducatorRequest.countDocuments({ status: "approved" });
    const allEducators = await User.find({ role: "educator" }).select("_id");
    const educatorUserIds = allEducators.map((u) => u._id);
    const educatorsWithRequests = await EducatorRequest.find({ userId: { $in: educatorUserIds } }).select("userId");
    const educatorIdsWithRequest = new Set(educatorsWithRequests.map((r) => r.userId.toString()));
    const legacyEducatorCount = educatorUserIds.filter((id) => !educatorIdsWithRequest.has(id.toString())).length;
    const totalEducators = approvedRequestCount + legacyEducatorCount;

    return res.status(200).json({ 
      message: `Educator request ${status} successfully`, 
      request: updatedRequest,
      totalEducators
    });
  } catch (error) {
    console.error("Error updating educator request status:", error);
    return res.status(500).json({ message: "Server error updating request status" });
  }
};

// @desc    Get count of unseen pending educator requests (for sidebar badge)
// @route   GET /api/admin/educator-requests/unseen-count
// @access  Private (Admin only)
export const getUnseenRequestCount = async (req, res) => {
  try {
    const count = await EducatorRequest.countDocuments({ status: "pending", isSeen: false });
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unseen request count:", error);
    return res.status(500).json({ message: "Server error fetching unseen count" });
  }
};

// @desc    Mark all unseen pending requests as seen
// @route   PATCH /api/admin/educator-requests/mark-seen
// @access  Private (Admin only)
export const markRequestsAsSeen = async (req, res) => {
  try {
    await EducatorRequest.updateMany(
      { status: "pending", isSeen: false },
      { $set: { isSeen: true } }
    );
    return res.status(200).json({ message: "All pending requests marked as seen" });
  } catch (error) {
    console.error("Error marking requests as seen:", error);
    return res.status(500).json({ message: "Server error marking requests as seen" });
  }
};

// @desc    Get per-educator earnings breakdown for admin
// @route   GET /api/admin/educator-earnings
// @access  Private (Admin only)
export const getEducatorEarnings = async (req, res) => {
  try {
    const educators = await Course.aggregate([
      // Stage 1: Project fields needed for calculation
      {
        $project: {
          creator: 1,
          price: { $ifNull: ["$price", 0] },
          enrolledCount: { $size: { $ifNull: ["$enrolledStudents", []] } },
        },
      },
      // Stage 2: Calculate revenue per course
      {
        $addFields: {
          revenue: { $multiply: ["$price", "$enrolledCount"] },
        },
      },
      // Stage 3: Group by educator (creator)
      {
        $group: {
          _id: "$creator",
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: "$enrolledCount" },
          totalEarnings: { $sum: "$revenue" },
        },
      },
      // Stage 4: Lookup educator details from users collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "educatorInfo",
        },
      },
      { $unwind: "$educatorInfo" },
      // Stage 5: Shape the output
      {
        $project: {
          _id: 1,
          name: "$educatorInfo.name",
          email: "$educatorInfo.email",
          photoUrl: "$educatorInfo.photoUrl",
          totalCourses: 1,
          totalStudents: 1,
          totalEarnings: 1,
        },
      },
      // Stage 6: Sort by highest earnings first
      { $sort: { totalEarnings: -1 } },
    ]);

    return res.status(200).json(educators);
  } catch (error) {
    console.error("Error in getEducatorEarnings:", error);
    return res.status(500).json({ message: "Server error fetching educator earnings" });
  }
};
