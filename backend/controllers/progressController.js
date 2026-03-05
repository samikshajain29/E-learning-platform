import Progress from "../models/progressModel.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";

// Update lecture progress when student watches a lecture
export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId, watchedPercentage } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!courseId || !lectureId || watchedPercentage === undefined) {
            return res.status(400).json({
                message: "Course ID, Lecture ID, and watched percentage are required"
            });
        }

        // Validate watched percentage
        if (watchedPercentage < 0 || watchedPercentage > 100) {
            return res.status(400).json({
                message: "Watched percentage must be between 0 and 100"
            });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if lecture exists
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        // Check if user is enrolled in the course
        const user = await User.findById(userId);
        const isEnrolled = user.enrolledCourses?.some(
            (courseRef) => courseRef.toString() === courseId
        );

        if (!isEnrolled && user.role !== "educator") {
            return res.status(403).json({
                message: "User is not enrolled in this course"
            });
        }

        // Only process if watched percentage is 100%
        if (watchedPercentage < 100) {
            return res.status(200).json({
                message: "Progress tracked but lecture not completed (watched < 100%)"
            });
        }

        // Check if already completed
        const existingProgress = await Progress.findOne({
            userId,
            lectureId
        });

        if (existingProgress?.completed) {
            return res.status(200).json({
                message: "Lecture already completed",
                isCompleted: true
            });
        }

        // Create or update progress
        const progressData = {
            userId,
            courseId,
            lectureId,
            completed: true,
            watchedPercentage: 100
        };

        let progress;
        if (existingProgress) {
            progress = await Progress.findByIdAndUpdate(
                existingProgress._id,
                progressData,
                { new: true, runValidators: true }
            );
        } else {
            progress = new Progress(progressData);
            await progress.save();
        }

        // Also update user's courseProgress array for backward compatibility
        const userProgress = user.courseProgress?.find(
            (p) => p.courseId.toString() === courseId
        );

        if (userProgress) {
            // Add lecture to completedLectures if not already there
            const lectureObjectId = lectureId;
            const isLectureAlreadyCompleted = userProgress.completedLectures?.some(
                (lecId) => lecId.toString() === lectureObjectId.toString()
            );

            if (!isLectureAlreadyCompleted) {
                userProgress.completedLectures.push(lectureObjectId);
                userProgress.lastAccessed = new Date();
                await user.save();
            }
        }

        return res.status(200).json({
            message: "Lecture marked as completed",
            isCompleted: true,
            progress: progress
        });

    } catch (error) {
        console.error("Update lecture progress error:", error);
        return res.status(500).json({
            message: `Failed to update progress: ${error.message}`
        });
    }
};

// Get educator dashboard progress statistics
export const getEducatorProgressStats = async (req, res) => {
    try {
        const { courseId } = req.params;
        const educatorId = req.userId;

        // Verify course belongs to this educator
        const course = await Course.findOne({
            _id: courseId,
            creator: educatorId
        }).populate("lectures");

        if (!course) {
            return res.status(404).json({
                message: "Course not found or unauthorized"
            });
        }

        const totalLectures = course.lectures?.length || 0;

        // Get all enrolled students (excluding educator)
        const students = await User.find({
            enrolledCourses: courseId,
            _id: { $ne: educatorId }
        }).select("name email createdAt");

        // Get progress data for all students
        const studentStats = await Promise.all(
            students.map(async (student) => {
                // Count completed lectures for this student in this course
                const completedLectures = await Progress.countDocuments({
                    userId: student._id,
                    courseId: courseId,
                    completed: true
                });

                const percentage = totalLectures > 0
                    ? Math.round((completedLectures / totalLectures) * 100)
                    : 0;

                return {
                    userId: student._id,
                    studentName: student.name,
                    email: student.email,
                    completedLectures: completedLectures,
                    totalLectures: totalLectures,
                    percentage: percentage
                };
            })
        );

        return res.status(200).json({
            courseId: course._id,
            courseName: course.title,
            totalLectures: totalLectures,
            studentStats: studentStats
        });

    } catch (error) {
        console.error("Get educator progress stats error:", error);
        return res.status(500).json({
            message: `Failed to get progress stats: ${error.message}`
        });
    }
};

// Get student's progress for a specific lecture (optional helper)
export const getLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.query;
        const userId = req.userId;

        if (!courseId || !lectureId) {
            return res.status(400).json({
                message: "Course ID and Lecture ID are required"
            });
        }

        const progress = await Progress.findOne({
            userId,
            courseId,
            lectureId
        });

        return res.status(200).json({
            isCompleted: progress?.completed || false,
            watchedPercentage: progress?.watchedPercentage || 0
        });

    } catch (error) {
        console.error("Get lecture progress error:", error);
        return res.status(500).json({
            message: `Failed to get lecture progress: ${error.message}`
        });
    }
};

// Get total completed lectures count for a course
export const getCourseCompletionStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;

        if (!courseId) {
            return res.status(400).json({
                message: "Course ID is required"
            });
        }

        // Count completed lectures for this user in this course
        const completedLectures = await Progress.countDocuments({
            userId,
            courseId,
            completed: true
        });

        // Get total lectures in the course
        const course = await Course.findById(courseId).select('lectures');
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const totalLectures = course.lectures?.length || 0;
        const completionPercentage = totalLectures > 0
            ? Math.round((completedLectures / totalLectures) * 100)
            : 0;

        return res.status(200).json({
            completedLectures,
            totalLectures,
            completionPercentage,
            isFullyCompleted: completedLectures === totalLectures && totalLectures > 0
        });

    } catch (error) {
        console.error("Get course completion status error:", error);
        return res.status(500).json({
            message: `Failed to get course completion status: ${error.message}`
        });
    }
};