import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import AssignmentSubmission from "../models/assignmentSubmissionModel.js";

export const getStudentDetails = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrolledCoursesDetails = [];

    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      for (const courseId of student.enrolledCourses) {
        const course = await Course.findById(courseId);
        if (!course) continue;

        // Get enrollment date
        let enrolledAt = null;
        if (student.enrollmentDates && student.enrollmentDates.length > 0) {
          const enrollmentRecord = student.enrollmentDates.find(
            (record) => record.course.toString() === courseId.toString()
          );
          if (enrollmentRecord) {
            enrolledAt = enrollmentRecord.enrolledAt;
          }
        }

        // Check AssignmentSubmission for this course and student
        const submission = await AssignmentSubmission.findOne({
          courseId: courseId,
          studentId: studentId,
        });

        enrolledCoursesDetails.push({
          courseId: courseId,
          courseName: course.title,
          enrolledAt: enrolledAt,
          assignmentCompleted: !!submission,
          score: submission ? submission.score : null,
          totalMarks: submission ? submission.totalMarks : null
        });
      }
    }

    const response = {
      name: student.name,
      email: student.email,
      enrolledCourses: enrolledCoursesDetails,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching student details:", error);
    return res.status(500).json({ message: "Internal server error fetching student details" });
  }
};
