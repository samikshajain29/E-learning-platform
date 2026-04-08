import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong, FaDownload, FaCopy, FaChartBar } from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";
import { serverUrl } from "../../App";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
} from "recharts";

function Dashboard() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStudentList, setShowStudentList] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressStats, setProgressStats] = useState([]); // New state for API data

  // Student Details Modal State
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetailsModalOpen, setStudentDetailsModalOpen] = useState(false);
  const [studentDetailsData, setStudentDetailsData] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          serverUrl + "/api/course/dashboard-stats",
          { withCredentials: true }
        );
        setDashboardStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (userData?.role === "educator") {
      fetchDashboardStats();
    }
  }, [userData]);

  // Fetch student progress for selected course (using new progress API)
  const fetchStudentProgress = async (courseId) => {
    try {
      setLoadingProgress(true);

      // Try new progress API first
      try {
        const response = await axios.get(
          serverUrl + `/api/progress/educator/${courseId}`,
          { withCredentials: true }
        );

        // Transform data to match existing table structure
        const transformedData = response.data.studentStats?.map(student => ({
          studentId: student.userId,
          studentName: student.studentName,
          studentEmail: student.email,
          enrolledAt: student.enrolledAt || null, // Fetched from new API
          completedLectures: student.completedLectures,
          totalLectures: student.totalLectures,
          completionPercentage: student.percentage
        })) || [];

        setProgressStats(response.data.studentStats || []);
        setStudentProgress(transformedData);
        return;
      } catch (newApiError) {
        console.log("New progress API not available, falling back to old API");
        // Fallback to old API
        const response = await axios.get(
          serverUrl + `/api/course/student-progress/${courseId}`,
          { withCredentials: true }
        );
        setStudentProgress(response.data.studentProgress || []);
        setProgressStats([]);
      }
    } catch (error) {
      console.error("Error fetching student progress:", error);
      toast.error("Failed to load student progress");
      setStudentProgress([]);
      setProgressStats([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setShowStudentList(true);
    fetchStudentProgress(course.courseId);
  };

  // Handle student click to fetch details
  const handleStudentClick = async (studentId) => {
    if (!studentId) return;
    setSelectedStudentId(studentId);
    setStudentDetailsModalOpen(true);
    setStudentDetailsLoading(true);
    try {
      const response = await axios.get(`${serverUrl}/api/students/${studentId}/details`, {
        withCredentials: true,
      });
      setStudentDetailsData(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details");
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  // Generate CSV content
  const generateCSV = (courseData) => {
    if (!courseData || !courseData.students || courseData.students.length === 0) {
      return null;
    }

    const headers = ["Student Name", "Email", "Enrollment Date"];
    const rows = courseData.students.map((student) => [
      student.name || "N/A",
      student.email || "N/A",
      student.enrolledAt
        ? new Date(student.enrolledAt).toLocaleDateString()
        : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  };

  // Download CSV
  const downloadCSV = (courseData) => {
    const csvContent = generateCSV(courseData);
    if (!csvContent) {
      toast.error("No student data available for export");
      return;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${courseData.courseName.replace(/[^a-z0-9]/gi, "_")}_students.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV downloaded successfully!");
  };

  // Copy to clipboard
  const copyToClipboard = (courseData) => {
    if (!courseData || !courseData.students || courseData.students.length === 0) {
      toast.error("No student data available to copy");
      return;
    }

    const textContent = [
      `Course: ${courseData.courseName}`,
      `Total Students: ${courseData.enrolledCount}`,
      `\nStudent List:`,
      `${"=".repeat(50)}`,
      ...courseData.students.map(
        (student, index) =>
          `${index + 1}. ${student.name || "N/A"} - ${student.email || "N/A"}`
      ),
    ].join("\n");

    navigator.clipboard
      .writeText(textContent)
      .then(() => {
        toast.success("Student data copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  // Prepare chart data
  const courseProgressData =
    dashboardStats?.courseStats?.map((course) => ({
      name: course.courseName?.slice(0, 10) + "...",
      lectures: course.lectureCount || 0,
    })) || [];

  const enrollmentData =
    dashboardStats?.courseStats?.map((course) => ({
      name:
        course.courseName.length > 12
          ? course.courseName.slice(0, 12) + "…"
          : course.courseName,
      enrolled: course.enrolledCount || 0,
    })) || [];

  // Chart colors
  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  // Circular Progress Component
  const CircularProgress = ({ percentage }) => {
    const data = [
      { name: "Completed", value: percentage },
      { name: "Remaining", value: 100 - percentage },
    ];

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-16 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={20}
                outerRadius={30}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#000000" />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Student Progress Circular Component (smaller size for table)
  const StudentProgressCircular = ({ percentage }) => {
    const data = [
      { name: "Completed", value: percentage },
      { name: "Remaining", value: 100 - percentage },
    ];

    // Determine color based on completion percentage
    const getColor = () => {
      if (percentage >= 80) return "#10B981"; // Green
      if (percentage >= 50) return "#F59E0B"; // Orange
      return "#EF4444"; // Red
    };

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-14 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={18}
                outerRadius={26}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={getColor()} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-800">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate completion percentage for a course
  // Formula: (Enrolled Students / Maximum Possible Engagement) × 100
  // For simplicity: if course has lectures and students, assume 70% average completion
  // In a real system, this would track individual student progress data

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-xl font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <FaArrowLeftLong
        className="absolute top-[10%] left-[10%] w-[22px] h-[22px] cursor-pointer z-10"
        onClick={() => navigate("/")}
      />
      <div className="w-full px-6 py-10 bg-gray-50 space-y-10">
        {/* Main Profile Section */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={userData?.photoUrl || `https://ui-avatars.com/api/?name=${userData?.name}`}
            className="w-28 h-28 rounded-full object-cover border-4 border-black shadow-md"
            alt="Educator"
          />
          <div className="text-center md:text-left space-y-1 flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {userData?.name || "Educator"} 👋
            </h1>
            <h1 className="text-xl font-semibold text-gray-800">
              Total Earning: ₹{(dashboardStats?.totalEarnings || 0).toLocaleString()}
            </h1>
            <p className="text-gray-600 text-sm">
              {userData?.description || "Start Creating Courses for Your Students"}
            </p>
            <button
              className="px-[10px] py-[10px] border-2 bg-black border-black text-white rounded-[10px] text-[15px] font-light cursor-pointer hover:bg-gray-800 transition-colors mt-2"
              onClick={() => navigate("/courses")}
            >
              Create Courses
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-black">{dashboardStats?.totalCourses || 0}</div>
            <div className="text-gray-600 mt-2">Total Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-black">{dashboardStats?.totalStudents || 0}</div>
            <div className="text-gray-600 mt-2">Total Students</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-black">
              ₹{(dashboardStats?.totalEarnings || 0).toLocaleString()}
            </div>
            <div className="text-gray-600 mt-2">Total Revenue</div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Course Progress Graph */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Course Progress (Lectures)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={courseProgressData}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="lectures" fill="#000000" radius={[5, 5, 0, 0]}>
                  {courseProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Enrollment Data Graph */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Students Enrollment</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={enrollmentData}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrolled" fill="#000000" radius={[5, 5, 0, 0]}>
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Statistics & Student List Section */}
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartBar /> Detailed Course Statistics
            </h2>
          </div>

          {/* Course Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course to View Student Details
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedCourse?.courseId || ""}
              onChange={(e) => {
                const course = dashboardStats?.courseStats?.find(
                  (c) => c.courseId === e.target.value
                );
                if (course) {
                  handleCourseSelect(course);
                }
              }}
            >
              <option value="">-- Select a course --</option>
              {dashboardStats?.courseStats?.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName} ({course.enrolledCount} students)
                </option>
              ))}
            </select>
          </div>

          {/* Course Details Table */}
          {dashboardStats?.courseStats && dashboardStats.courseStats.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lectures
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardStats.courseStats.map((course) => (
                    <tr
                      key={course.courseId}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCourse?.courseId === course.courseId ? "bg-gray-100" : ""
                        }`}
                      onClick={() => handleCourseSelect(course)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {course.courseName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{course.lectureCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{course.enrolledCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ₹{course.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${course.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Student List Section */}
          {showStudentList && selectedCourse && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Enrolled Students - {selectedCourse.courseName}
                </h3>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => downloadCSV(selectedCourse)}
                    disabled={!selectedCourse.students || selectedCourse.students.length === 0}
                  >
                    <FaDownload /> Download CSV
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => copyToClipboard(selectedCourse)}
                    disabled={!selectedCourse.students || selectedCourse.students.length === 0}
                  >
                    <FaCopy /> Copy to Clipboard
                  </button>
                </div>
              </div>

              {selectedCourse.students && selectedCourse.students.length > 0 ? (
                <div className="overflow-x-auto">
                  {loadingProgress ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading student progress...
                    </div>
                  ) : studentProgress.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Lectures Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Enrollment Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentProgress.map((student, index) => (
                          <tr 
                            key={student.studentId || index} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleStudentClick(student.studentId)}
                          >
                            <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {student.studentName || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {student.studentEmail || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <StudentProgressCircular percentage={student.completionPercentage} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-center">
                              {student.completedLectures} / {student.totalLectures}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {student.enrolledAt
                                ? new Date(student.enrolledAt).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No progress data available. Students haven't started watching lectures yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students enrolled in this course yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {studentDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
              <button
                className="text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
                onClick={() => setStudentDetailsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {studentDetailsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                </div>
              ) : studentDetailsData ? (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-white border rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <img
                      src={`https://ui-avatars.com/api/?name=${studentDetailsData.name}&background=111827&color=fff&size=128`}
                      alt={studentDetailsData.name}
                      className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-md"
                    />
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-2xl font-bold text-gray-900">{studentDetailsData.name}</h3>
                      <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        {studentDetailsData.email}
                      </p>
                    </div>
                  </div>

                  {/* Enrolled Courses */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      Enrolled Courses
                    </h4>
                    {studentDetailsData.enrolledCourses && studentDetailsData.enrolledCourses.length > 0 ? (
                      <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Name</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentDetailsData.enrolledCourses.map((course) => (
                              <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                      course.assignmentCompleted
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                    }`}
                                  >
                                    {course.assignmentCompleted ? (
                                      <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg> Completed</>
                                    ) : (
                                      <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> Not Completed</>
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {course.assignmentCompleted && course.score !== null ? (
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-sm font-bold text-gray-900">{course.score}</span>
                                      {course.totalMarks && <span className="text-xs text-gray-500">/ {course.totalMarks}</span>}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400 font-medium">N/A</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <p className="text-gray-500 text-sm">Student is not enrolled in any courses yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">Failed to load student details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
