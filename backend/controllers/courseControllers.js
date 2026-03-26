import { connect } from "mongoose";
import Course from "../models/courseModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";

export const createCourse = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: "title or Category is required" });
    }
    const course = await Course.create({
      title,
      category,
      creator: req.userId,
    });
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: `CreateCourse error ${error}` });
  }
};

export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate(
      "lectures reviews creator"
    );
    if (!courses) {
      return res.status(400).json({ message: "Courses are not found" });
    }
    return res.status(200).json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to get isPublished Courses ${error}` });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.userId;
    const courses = await Course.find({ creator: userId }).populate("creator");
    if (!courses) {
      return res.status(400).json({ message: "Courses are not found" });
    }
    return res.status(200).json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to get Creator Courses ${error}` });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      subTitle,
      description,
      category,
      level,
      isPublished,
      price,
    } = req.body;
    let thumbnail;
    if (req.file) {
      thumbnail = await uploadOnCloudinary(req.file.path);
    }
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course is not found" });
    }
    const updateData = {
      title,
      subTitle,
      description,
      category,
      level,
      isPublished,
      price,
      thumbnail,
    };
    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: `failed to edit Course ${error}` });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course is not found" });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to get Course by id ${error}` });
  }
};

export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course is not found" });
    }
    course = await Course.findByIdAndDelete(courseId, { new: true });
    return res.status(200).json({ message: "Course removed" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to delete Course ${error}` });
  }
};

//for lecture

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    if (!lectureTitle || !courseId) {
      return res.status(400).json({ message: "lectureTitle is required" });
    }
    const lecture = await Lecture.create({ lectureTitle });
    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
    }
    await course.populate("lectures");
    await course.save();
    return res.status(201).json({ lecture, course });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to create Lecture ${error}` });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course is not found" });
    }
    await course.populate("lectures");
    await course.save();
    return res.status(200).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to getCourseLecture ${error}` });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { isPreviewFree, lectureTitle } = req.body;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture is not found" });
    }
    let videoUrl;
    if (req.file) {
      videoUrl = await uploadOnCloudinary(req.file.path);
      lecture.videoUrl = videoUrl;
    }
    if (lectureTitle) {
      lecture.lectureTitle = lectureTitle;
    }
    lecture.isPreviewFree = isPreviewFree;
    await lecture.save();
    return res.status(200).json(lecture);
  } catch (error) {
    return res.status(500).json({ message: `failed to edit Lecture ${error}` });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture is not found" });
    }
    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );
    return res.status(200).json({ message: "Lecture Removed" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to remove Lecture ${error}` });
  }
};

//get creator

export const getCreatorById = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get creator ${error}` });
  }
};

// NEW: Get courses by specific educator ID (for public profile viewing)
export const getCoursesByEducatorId = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const courses = await Course.find({ creator: educatorId, isPublished: true })
      .populate("creator")
      .populate("reviews");
    if (!courses) {
      return res.status(404).json({ message: "Courses not found" });
    }
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      message: `Failed to get courses by educator ID: ${error.message}`,
    });
  }
};

// NEW: Get detailed dashboard statistics for educator
export const getDashboardStats = async (req, res) => {
  try {
    const educatorId = req.userId;

    // Get all courses by this educator with populated data
    const courses = await Course.find({ creator: educatorId })
      .populate({
        path: "enrolledStudents",
        select: "name email createdAt role enrollmentDates",
      })
      .populate("lectures")
      .lean();

    if (!courses) {
      return res.status(404).json({ message: "No courses found" });
    }

    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudentsSet = new Set();
    let totalEarnings = 0;

    const courseStats = courses.map((course) => {
      // Filter enrolledStudents to exclude the course creator (but include educators who purchased)
      const enrolledStudentsAsStudents = course.enrolledStudents?.filter(student =>
        student._id.toString() !== educatorId.toString()
      ) || [];
      const enrolledCount = enrolledStudentsAsStudents.length;
      const revenue = (course.price || 0) * enrolledCount;
      totalEarnings += revenue;

      // Add unique students to set
      enrolledStudentsAsStudents.forEach((student) => {
        if (student && student._id) {
          totalStudentsSet.add(student._id.toString());
        }
      });

      const studentsWithEnrollments = enrolledStudentsAsStudents.map(student => {
        const enrollment = student.enrollmentDates?.find(e => e.course?.toString() === course._id.toString());
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          enrolledAt: enrollment ? enrollment.enrolledAt : null,
          createdAt: student.createdAt
        };
      });

      return {
        courseId: course._id,
        courseName: course.title,
        thumbnail: course.thumbnail,
        price: course.price || 0,
        lectureCount: course.lectures?.length || 0,
        enrolledCount: enrolledCount,
        revenue: revenue,
        isPublished: course.isPublished,
        students: studentsWithEnrollments, // Include all enrolled users except creator
        createdAt: course.createdAt,
      };
    });

    return res.status(200).json({
      totalCourses,
      totalStudents: totalStudentsSet.size,
      totalEarnings,
      courseStats,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to get dashboard statistics: ${error.message}`,
    });
  }
};

// NEW: Get student progress for a specific course
export const getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.userId;

    // Verify course belongs to this educator
    const course = await Course.findOne({ _id: courseId, creator: educatorId })
      .populate("lectures")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    const totalLectures = course.lectures?.length || 0;

    // Get all enrolled students with their progress (exclude the course creator/educator)
    const students = await User.find({
      enrolledCourses: courseId,
      _id: { $ne: course.creator }, // Exclude the course creator from student list
    })
      .select("name email courseProgress createdAt role enrollmentDates")
      .lean();

    // Calculate progress for each student
    const studentProgress = students.map((student) => {
      // Find progress for this specific course
      const progress = student.courseProgress?.find(
        (p) => p.courseId.toString() === courseId
      );

      const completedCount = progress?.completedLectures?.length || 0;
      const completionPercentage = totalLectures > 0
        ? Math.round((completedCount / totalLectures) * 100)
        : 0;

      const enrollment = student.enrollmentDates?.find(e => e.course?.toString() === courseId);
      const enrolledAt = enrollment ? enrollment.enrolledAt : null;

      return {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        enrolledAt: enrolledAt,
        completedLectures: completedCount,
        totalLectures: totalLectures,
        completionPercentage: completionPercentage,
        lastAccessed: progress?.lastAccessed || null,
      };
    });

    return res.status(200).json({
      courseId: course._id,
      courseName: course.title,
      totalLectures: totalLectures,
      studentProgress: studentProgress,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to get student progress: ${error.message}`,
    });
  }
};

// NEW: Update course status
export const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status value
    if (!["ongoing", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'ongoing' or 'completed'" });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course creator
    if (course.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the course creator can update the status" });
    }

    // Update the status
    course.status = status;
    await course.save();

    return res.status(200).json({
      message: "Course status updated successfully",
      status: course.status,
      courseId: course._id
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to update course status: ${error.message}`,
    });
  }
};
