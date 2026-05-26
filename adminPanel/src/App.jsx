import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EducatorRequests from "./pages/EducatorRequests";
import EducatorEarnings from "./pages/EducatorEarnings";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Mobile/Tablet only) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </header>

        {/* Content container */}
        <div className="flex-1 overflow-y-auto md:ml-64">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/admin/educator-requests" element={<EducatorRequests />} />
                  <Route path="/admin/educator-earnings" element={<EducatorEarnings />} />
                  {/* Add more protected routes here in future */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
