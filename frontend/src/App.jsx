import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ApplyEducator from "./pages/ApplyEducator";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
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

  const { userData } = useSelector((state) => state.user);
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
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <Dashboard />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/courses"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <Courses />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/createcourse"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <CreateCourses />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/editcourse/:courseId"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <EditCourse />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/createlecture/:courseId"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <CreateLecture />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/create-assignment/:courseId"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <CreateAssignment />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
        />
        <Route
          path="/editlecture/:courseId/:lectureId"
          element={
            userData?.role === "educator" ? userData?.hasAppliedForEducator ? (
              <EditLecture />
            ) : (
              <Navigate to={"/apply-educator"} />
            ) : (
              <Navigate to={"/signup"} />
            )
          }
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