import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Nav from "../component/Nav";
import Card from "../component/Card";
import { FaArrowLeftLong } from "react-icons/fa6";
import { serverUrl } from "../App";

function EducatorProfile() {
  const navigate = useNavigate()
  const { educatorId } = useParams();
  const [educator, setEducator] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducatorProfile = async () => {
      try {
        // Fetch educator details
        const educatorResponse = await axios.post(
          serverUrl + "/api/course/creator",
          { userId: educatorId },
          { withCredentials: true },
        );

        setEducator(educatorResponse.data);

        // Fetch courses by this educator using the new endpoint
        const coursesResponse = await axios.get(
          serverUrl + `/api/course/getcreator/${educatorId}`,
          { withCredentials: true },
        );

        // No need to filter - backend already returns only courses by this educator
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error("Error fetching educator profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (educatorId) {
      fetchEducatorProfile();
    }
  }, [educatorId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Nav />
        <div className="flex items-center justify-center w-full py-[130px]">
          <div className="text-xl font-semibold">
            Loading educator profile...
          </div>
        </div>
      </div>
    );
  }

  if (!educator) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Nav />
        <div className="flex items-center justify-center w-full py-[130px]">
          <div className="text-xl font-semibold text-red-500">
            Educator not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav />
      <main className="w-full py-[130px] px-4">
        {/* Educator Profile Header */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
          <FaArrowLeftLong
          className="text-black w-[22px] h-[22px] cursor-pointer"
          onClick={() => navigate(-1)}
          />
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-600">
                {educator.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">
                {educator.name}
              </h1>
              {educator.email && (
                <p className="text-gray-600 mt-2">{educator.email}</p>
              )}
              <p className="text-gray-500 mt-1">
                {courses.length} {courses.length === 1 ? "Course" : "Courses"}{" "}
                Created
              </p>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Courses by {educator.name}
          </h2>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <Card
                  key={index}
                  thumbnail={course.thumbnail}
                  title={course.title}
                  category={course.category}
                  price={course.price}
                  id={course._id}
                  reviews={course.reviews}
                  creator={course.creator} // Pass creator information
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No courses available from this educator
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EducatorProfile;