import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Users,
  IndianRupee,
  Search,
  TrendingUp,
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const EducatorEarnings = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchEducatorEarnings = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await axios.get(`${API_URL}/admin/educator-earnings`);
      setEducators(res.data);
      if (!isBackground) setError(null);
    } catch (err) {
      if (err.response?.status !== 401 && !isBackground) {
        setError("Failed to fetch educator earnings. Please try again later.");
      }
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducatorEarnings();

    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchEducatorEarnings(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter educators by search
  const filteredEducators = educators.filter(
    (edu) =>
      edu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edu.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary stats
  const totalPlatformEarnings = educators.reduce((sum, e) => sum + e.totalEarnings, 0);
  const totalPlatformStudents = educators.reduce((sum, e) => sum + e.totalStudents, 0);
  const totalPlatformCourses = educators.reduce((sum, e) => sum + e.totalCourses, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Educator Earnings</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Detailed earnings breakdown for all educators on the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 rounded-lg text-white bg-emerald-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Platform Earnings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalPlatformEarnings.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 rounded-lg text-white bg-purple-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students Enrolled</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalPlatformStudents.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 rounded-lg text-white bg-orange-500">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalPlatformCourses}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search educators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Educators Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredEducators.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg">
              {searchQuery ? "No educators match your search" : "No educators found"}
            </p>
            <p className="text-sm mt-1">
              {searchQuery
                ? "Try adjusting your search query."
                : "Educators will appear here once they create courses."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Educator
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEducators.map((edu, index) => (
                  <tr
                    key={edu._id}
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {edu.photoUrl ? (
                          <img
                            src={edu.photoUrl}
                            alt={edu.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center text-white font-semibold text-sm ${edu.photoUrl ? "hidden" : "flex"}`}
                        >
                          {edu.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <span className="font-medium text-gray-900">{edu.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{edu.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                        <BookOpen size={14} />
                        {edu.totalCourses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        <Users size={14} />
                        {edu.totalStudents}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
                          edu.totalEarnings > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {edu.totalEarnings > 0 && <TrendingUp size={14} />}
                        ₹{edu.totalEarnings.toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer summary */}
      {filteredEducators.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 text-right">
          Showing {filteredEducators.length} of {educators.length} educator{educators.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default EducatorEarnings;
