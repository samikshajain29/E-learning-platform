import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosPlayCircle } from "react-icons/io";
import { serverUrl } from "../App";

function ViewLectures() {
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);
  const selectedCourse = courseData?.find((course) => course._id === courseId);
  const [creatorData, setCreatorData] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(
    selectedCourse?.lectures?.[0] || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleCreator = async () => {
      if (selectedCourse?.creator) {
        try {
          const result = await axios.post(
            serverUrl + "/api/course/creator",
            {
              userId: selectedCourse?.creator,
            },
            { withCredentials: true }
          );
          console.log(result.data);
          setCreatorData(result.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    handleCreator();
  }, [selectedCourse]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6">
      {/* left or top */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center justify-start gap-[20px] text-gray-800">
            <FaArrowLeftLong
              className="text-black w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/")}
            />
            {selectedCourse?.title}
          </h2>
          <div className="mt-2 flex gap-4 text-sm text-gray-500 font-medium">
            <span>Category: {selectedCourse?.category}</span>
            <span>Level: {selectedCourse?.level}</span>
          </div>
        </div>

        {/* video player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-300">
          {selectedLecture?.videoUrl ? (
            <video
              className="w-full h-full object-contain"
              src={selectedLecture?.videoUrl}
              controls
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a lecture to start watching
            </div>
          )}
        </div>
        <div className="mt-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedLecture?.lectureTitle}
          </h2>
        </div>
      </div>
      {/* right or bottom */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800">All Lectures</h2>
        <div className="flex flex-col gap-3 mb-6">
          {selectedCourse?.lectures?.length > 0 ? (
            selectedCourse?.lectures?.map((lecture, index) => (
              <button
                key={index}
                onClick={() => setSelectedLecture(lecture)}
                className={`flex items-center justify-between p-3 rounded-lg border transition text-left ${
                  selectedLecture?._id === lecture._id
                    ? "bg-gray-200 border-gray-500"
                    : "hover:bg-gray-50 border-gray-300"
                }`}
              >
                <h2 className="text-sm font-semibold text-gray-800">
                  {lecture.lectureTitle}
                </h2>
                <IoIosPlayCircle className="text-lg text-black" />
              </button>
            ))
          ) : (
            <p>No lectures available</p>
          )}
        </div>
        {/* educator info */}
        {creatorData && (
          <div className="mt-4 border-t border-black pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Educator
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={creatorData?.photoUrl}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-800">
                {creatorData?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {creatorData?.description}
              </p>
              <p className="text-sm text-gray-600">{creatorData?.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewLectures;
