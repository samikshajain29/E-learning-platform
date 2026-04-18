import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ApplyEducator from "./pages/ApplyEducator";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import getCurrentUser from "./customHooks/getCurrentUser";
import { useSelector } from "react-redux";
import Profile from "./pages/Profile";
import ForgetPassword from "./pages/ForgetPassword";
import EditProfile from "./pages/EditProfile";
import Dashboard from "./pages/Educator/Dashboard";
import Courses from "./pages/Educator/Courses";
import CreateCourses from "./pages/Educator/CreateCourses";
import EditCourse from "./pages/Educator/EditCourse";
import getCreatorCourse from "./customHooks/getCreatorCourse";
import getPublishedCourse from "./customHooks/getPublishedCourse";
import AllCourses from "./pages/AllCourses";
import CreateLecture from "./pages/Educator/CreateLecture";
import EditLecture from "./pages/Educator/EditLecture";
import CreateAssignment from "./pages/Educator/CreateAssignment";
import ViewCourse from "./pages/ViewCourse";
import ScrollToTop from "./component/ScrollToTop";
import ViewLectures from "./pages/ViewLectures";
import MyEnrolledCourses from "./pages/MyEnrolledCourses";
import getAllReviews from "./customHooks/getAllReviews";
import SearchWithAi from "./pages/SearchWithAi";
import EducatorProfile from "./pages/EducatorProfile"; // Import the new component
import WishlistPage from "./pages/WishlistPage";
export const serverUrl = "http://localhost:8000";

function App() {
  getCurrentUser();
  getCreatorCourse();
  getPublishedCourse();
  getAllReviews();

  const { userData, authLoading } = useSelector((state) => state.user);

  const ProtectedEducatorRoute = ({ children }) => {
    if (authLoading) return <div className="flex justify-center items-center h-[80vh]"><ClipLoader size={50} color="black" /></div>;
    if (!userData) return <Navigate to="/login" />;
    if (userData.role !== "educator") return <Navigate to="/" />;
    if (userData.educatorStatus !== "approved") return <Navigate to="/apply-educator" />;
    return children;
  };

  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={userData ? <Profile /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/forget"
          element={!userData ? <ForgetPassword /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/editprofile"
          element={userData ? <EditProfile /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/allcourses"
          element={userData ? <AllCourses /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedEducatorRoute><Dashboard /></ProtectedEducatorRoute>}
        />
        <Route
          path="/courses"
          element={<ProtectedEducatorRoute><Courses /></ProtectedEducatorRoute>}
        />
        <Route
          path="/createcourse"
          element={<ProtectedEducatorRoute><CreateCourses /></ProtectedEducatorRoute>}
        />
        <Route
          path="/editcourse/:courseId"
          element={<ProtectedEducatorRoute><EditCourse /></ProtectedEducatorRoute>}
        />
        <Route
          path="/createlecture/:courseId"
          element={<ProtectedEducatorRoute><CreateLecture /></ProtectedEducatorRoute>}
        />
        <Route
          path="/create-assignment/:courseId"
          element={<ProtectedEducatorRoute><CreateAssignment /></ProtectedEducatorRoute>}
        />
        <Route
          path="/editlecture/:courseId/:lectureId"
          element={<ProtectedEducatorRoute><EditLecture /></ProtectedEducatorRoute>}
        />
        <Route
          path="/viewcourse/:courseId"
          element={userData ? <ViewCourse /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/viewlecture/:courseId"
          element={userData ? <ViewLectures /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/mycourses"
          element={
            userData ? <MyEnrolledCourses /> : <Navigate to={"/signup"} />
          }
        />
        <Route
          path="/search"
          element={userData ? <SearchWithAi /> : <Navigate to={"/signup"} />}
        />
        {/* New route for Educator Profile */}
        <Route
          path="/educator/:educatorId"
          element={userData ? <EducatorProfile /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/wishlist"
          element={userData ? <WishlistPage /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/apply-educator"
          element={userData ? <ApplyEducator /> : <Navigate to={"/login?redirect=/apply-educator"} />}
        />
      </Routes>
    </>
  );
}

export default App;