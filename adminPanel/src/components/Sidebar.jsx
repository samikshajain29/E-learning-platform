import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg";

const Sidebar = () => {
  const { logout } = useAuth();

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
          className="flex justify-center items-center gap-2 w-full px-4 py-2 bg-gray-50 text-gray-700 hover:bg-black hover:text-white rounded-lg transition-colors font-medium"
        >
          Educator Requests
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
    </div>
  );
};

export default Sidebar;
