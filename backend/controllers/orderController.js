import razorpay from "razorpay";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const RazorPayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RazorpayOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course is not found" });
    }
    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `${courseId}.toString()`,
    };
    const order = await RazorPayInstance.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to create Razorpay Order ${error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { courseId, userId, razorpay_order_id, enrollmentData } = req.body;
    const orderInfo = await RazorPayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId).populate("lectures");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Update user enrollment
      if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);

        // Update user's enrollment information if provided
        if (enrollmentData) {
          if (enrollmentData.phone) user.phone = enrollmentData.phone;
          if (enrollmentData.address) user.address = enrollmentData.address;
          if (enrollmentData.city) user.city = enrollmentData.city;
          if (enrollmentData.state) user.state = enrollmentData.state;
          if (enrollmentData.zipCode) user.zipCode = enrollmentData.zipCode;
          if (enrollmentData.dateOfBirth) user.dateOfBirth = enrollmentData.dateOfBirth;
          if (enrollmentData.education) user.education = enrollmentData.education;
        }

        await user.save();
      }

      // Update course enrollment
      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      // Send notifications asynchronously (won't block response)
      setImmediate(async () => {
        try {
          const sendNotifications = (await import("../utils/notificationService.js")).sendEnrollmentNotifications;
          await sendNotifications({
            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone,
            courseName: course.title,
          });
        } catch (error) {
          console.error("Notification error:", error.message);
        }
      });

      return res
        .status(200)
        .json({ message: "Payment verified and enrollment successful" });
    } else {
      return res.status(400).json({ message: "payment failed" });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error during payment verification ${error}`,
    });
  }
};
