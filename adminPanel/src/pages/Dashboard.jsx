import { useEffect, useState } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  IndianRupee, 
  PlayCircle,
  TrendingUp,
  Activity
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      // Fetch stats and analytics concurrently
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard-stats`),
        axios.get(`${API_URL}/admin/analytics`)
      ]);

      setStats(statsRes.data);
      
      // Reverse because backend gave us 30 days ago to today (or today to 30 days ago).
      // The backend loop was from 29 to 0, which means older to newer.
      setAnalytics(analyticsRes.data);
      if (!isBackground) setError(null);
    } catch (err) {
      // 401 is handled globally by the axios interceptor (auto-redirect to login)
      if (err.response?.status !== 401 && !isBackground) {
        setError("Failed to fetch dashboard data. Please try again later.");
      }
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh stats every 10 seconds to reflect approve/reject changes in real-time
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cards Configuration
  const statCards = [
    {
      title: "Today's Enrollments",
      value: stats?.todayEnrollments || 0,
      icon: TrendingUp,
      color: "bg-blue-500"
    },
    {
      title: "Today's Revenue",
      value: `₹${stats?.todayRevenue || 0}`,
      icon: Activity,
      color: "bg-green-500"
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue || 0}`,
      icon: IndianRupee,
      color: "bg-emerald-600"
    },
    {
      title: "Total Enrollments",
      value: stats?.totalUsers || 0, // Using Total Users for enrollment stats or could be separate metric
      icon: Users,
      color: "bg-purple-500"
    },
    {
      title: "Total Educators",
      value: stats?.totalEducators || 0,
      icon: GraduationCap,
      color: "bg-indigo-500"
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-orange-500"
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses || 0,
      icon: PlayCircle,
      color: "bg-teal-500"
    }
  ];

  // Chart Configuration
  const dates = analytics.map(item => item.date);
  const enrollmentsData = analytics.map(item => item.dailyEnrollments);
  const revenueData = analytics.map(item => item.dailyRevenue);

  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#8b5cf6', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: dates,
      labels: {
        format: 'dd MMM'
      }
    },
    yaxis: [
      {
        title: { text: 'Enrollments' },
      },
      {
        opposite: true,
        title: { text: 'Revenue (₹)' },
      }
    ],
    tooltip: { x: { format: 'dd MMM yyyy' } },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  const chartSeries = [
    {
      name: 'Enrollments',
      data: enrollmentsData
    },
    {
      name: 'Revenue',
      data: revenueData
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Track your platform's performance and growth</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-lg text-white ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Growth Analytics (Last 30 Days)</h2>
        <div className="w-full h-[400px]">
          <ReactApexChart 
            options={chartOptions} 
            series={chartSeries} 
            type="area" 
            height={400} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
