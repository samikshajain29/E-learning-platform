import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import logo from "../assets/logo.jpg";

const API_URL = "http://localhost:8000/api";

const Sidebar = () => {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [unseenCount, setUnseenCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchUnseenCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`${API_URL}/admin/educator-requests/unseen-count`);
      setUnseenCount(res.data.count);
    } catch (err) {
      // Silently fail — 401 handled globally by interceptor
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnseenCount();

    // Poll every 10 seconds for near-real-time badge updates
    intervalRef.current = setInterval(fetchUnseenCount, 10000);

    return () => clearInterval(intervalRef.current);
  }, [fetchUnseenCount]);

  // When navigating TO the educator-requests page, reset count immediately
  // (the EducatorRequests page will call mark-seen)
  useEffect(() => {
    if (location.pathname === "/admin/educator-requests") {
      setUnseenCount(0);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
      <div className="h-16 flex items-center px-6 gap-[10px] border-b border-gray-200">
        <img src={logo} alt="logo" className="w-[50px] h-[50px] rounded-full" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Panel
        </h1>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
              ? "bg-purple-50 text-purple-700 font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/educator-requests"
          className="flex justify-center items-center gap-2 w-full px-4 py-2 bg-gray-50 text-gray-700 hover:bg-black hover:text-white rounded-lg transition-colors font-medium relative"
        >
          Educator Requests
          {unseenCount > 0 && (
            <span
              className="absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center px-1.5 text-xs font-bold text-white rounded-full shadow-md"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                animation: "badgePulse 2s ease-in-out infinite",
              }}
            >
              {unseenCount > 99 ? "99+" : unseenCount}
            </span>
          )}
        </NavLink>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Badge pulse animation */}
      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
