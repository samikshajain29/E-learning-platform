import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
import axios from "axios";
import { setLectureData } from "../../redux/lectureSlice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

function EditLecture() {
  const { courseId, lectureId } = useParams();
  const { lectureData } = useSelector((state) => state.lecture);
  const selectedLecture = lectureData.find(
    (lecture) => lecture._id === lectureId
  );
  const navigate = useNavigate();
  const [lectureTitle, setLectureTitle] = useState(
    selectedLecture.lectureTitle
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const dispatch = useDispatch();

  const formdata = new FormData();
  formdata.append("lectureTitle", lectureTitle);
  formdata.append("videoUrl", videoUrl);
  formdata.append("isPreviewFree", isPreviewFree);

  const handleEditLecture = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + `/api/course/editlecture/${lectureId}`,
        formdata,
        { withCredentials: true }
      );
      console.log(result.data);
      dispatch(setLectureData([...lectureData, result.data]));
      toast.success("Lecture Updated");
      navigate("/courses");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const removeLecture = async () => {
    setLoading1(true);
    try {
      const result = await axios.delete(
        serverUrl + `/api/course/removelecture/${lectureId}`,
        { withCredentials: true }
      );
      console.log(result.data);
      setLoading1(false);
      navigate(`/createLecture/${courseId}`);
      toast.success("Lecture Removed");
    } catch (error) {
      setLoading1(false);
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* header */}
        <div className="flex items-center gap-2 mb-2">
          <FaArrowLeftLong
            className="text-gray-600 cursor-pointer"
            onClick={() => navigate(`/createlecture/${courseId}`)}
          />
          <h2 className="text-xl font-semibold text-gray-800">
            Update Course Lecture
          </h2>
        </div>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all text-sm"
          disabled={loading}
          onClick={removeLecture}
        >
          {loading1 ? <ClipLoader size={30} color="white" /> : "Remove Lecture"}
        </button>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor=""
            >
              LectureTitle *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[black] focus:outline-none"
              required
              onChange={(e) => setLectureTitle(e.target.value)}
              value={lectureTitle}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor=""
            >
              Video *
            </label>
            <input
              type="file"
              className="w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-700 file:text-white hover:file:bg-gray-500"
              required
              accept="video/*"
              onChange={(e) => setVideoUrl(e.target.files[0])}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="accent-[black] h-4 w-4 "
              id="isFree"
              onChange={() => setIsPreviewFree((prev) => !prev)}
            />
            <label htmlFor="isFree" className="text-sm text-gray-700">
              Is this Video FREE ?
            </label>
          </div>
          {loading ? <p>Uploading video... Please wait.</p> : ""}
        </div>
        <div className="pt-4">
          <button
            className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition"
            disabled={loading}
            onClick={handleEditLecture}
          >
            {loading ? (
              <ClipLoader size={30} color="white" />
            ) : (
              " Update Lecture"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditLecture;
