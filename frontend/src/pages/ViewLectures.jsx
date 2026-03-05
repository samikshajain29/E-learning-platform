import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosPlayCircle } from "react-icons/io";
import { serverUrl } from "../App";
import VideoPlayer from "../component/VideoPlayer";
import LectureQuestionSection from "../component/LectureQuestionSection";

function ViewLectures() {
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);
  const selectedCourse = courseData?.find((course) => course._id === courseId);
  const [creatorData, setCreatorData] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(
    selectedCourse?.lectures?.[0] || null,
  );
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showAttempt, setShowAttempt] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionScore, setSubmissionScore] = useState(null);
  const [allLecturesCompleted, setAllLecturesCompleted] = useState(false);

  // Check if user is enrolled in this course
  const isEnrolled = userData?.enrolledCourses?.some(
    (c) => (typeof c === "string" ? c : c._id).toString() === courseId,
  );

  useEffect(() => {
    const handleCreator = async () => {
      if (selectedCourse?.creator) {
        try {
          const result = await axios.post(
            serverUrl + "/api/course/creator",
            {
              userId: selectedCourse?.creator,
            },
            { withCredentials: true },
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

  // Check if user has access to lectures
  // Educator or creator: Always has access
  // Student: Only if enrolled
  const hasAccess =
    userData?.role === "educator" ||
    selectedCourse?.creator === userData?._id ||
    isEnrolled;

  // Redirect if no access
  useEffect(() => {
    if (userData && selectedCourse && !hasAccess) {
      navigate(`/viewcourse/${courseId}`);
    }
  }, [userData, selectedCourse, hasAccess, navigate, courseId]);

  // Handle progress update from VideoPlayer
  const handleProgressUpdate = (progressData) => {
    console.log("Progress updated:", progressData);
    // Refresh completion status when a lecture is completed
    if (progressData.completed && progressData.percentage === 100) {
      checkLectureCompletion();
    }
  };

  // Check if all lectures are completed
  const checkLectureCompletion = async () => {
    try {
      // Fetch user course completion status for this course
      const result = await axios.get(
        serverUrl + `/api/progress/course/${courseId}`,
        { withCredentials: true }
      );

      setAllLecturesCompleted(result.data.isFullyCompleted || false);
    } catch (error) {
      console.log("Could not fetch lecture completion status");
      setAllLecturesCompleted(false);
    }
  };

  // Fetch assignment for this course
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const result = await axios.get(
          serverUrl + `/api/course/assignment/${courseId}`,
          { withCredentials: true }
        );
        setAssignment(result.data.assignment);
      } catch (error) {
        // Assignment might not exist, that's okay
        console.log("No assignment found or error:", error.message);
      }
    };
    fetchAssignment();
  }, [courseId]);

  // Check submission status
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const result = await axios.get(
          serverUrl + `/api/course/assignment/submission-status/${courseId}`,
          { withCredentials: true }
        );
        if (result.data.submitted) {
          setHasSubmitted(true);
          setSubmissionScore(result.data);
        }
      } catch (error) {
        // No submission yet, that's okay
        console.log("No submission found");
      }
    };
    checkSubmissionStatus();
  }, [courseId]);

  useEffect(() => {
    checkLectureCompletion();
  }, [courseId]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Handle assignment submission
  const handleSubmitAssignment = async () => {
    // Validate all questions are answered
    const questionIds = assignment.questions.map((q) => q._id);
    for (const id of questionIds) {
      if (!selectedAnswers[id]) {
        alert("Please answer all questions before submitting");
        return;
      }
    }

    if (!confirm("Are you sure you want to submit? You can only submit once.")) {
      return;
    }

    try {
      const answers = questionIds.map((id) => ({
        questionId: id,
        selectedOption: selectedAnswers[id],
      }));

      const result = await axios.post(
        serverUrl + `/api/course/assignment/submit/${courseId}`,
        { answers },
        { withCredentials: true }
      );

      setHasSubmitted(true);
      setSubmissionScore({
        score: result.data.score,
        totalQuestions: result.data.totalQuestions,
        percentage: result.data.percentage,
      });
      setShowAttempt(false);
      alert(`Assignment submitted successfully! Score: ${result.data.score}/${result.data.totalQuestions}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit assignment");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6">
        {/* left or top */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center justify-start gap-[20px] text-gray-800">
                <FaArrowLeftLong
                  className="text-black w-[22px] h-[22px] cursor-pointer"
                  onClick={() => navigate("/")}
                />
                {selectedCourse?.title}
              </h2>

              <button
                onClick={() => window.open("https://sjaii.netlify.app/", "_blank")}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Ask Doubt with AI
              </button>
            </div>

            <div className="mt-2 flex gap-4 text-sm text-gray-500 font-medium">
              <span>Category: {selectedCourse?.category}</span>
              <span>Level: {selectedCourse?.level}</span>
            </div>
          </div>

          {/* video player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-300">
            {selectedLecture?.videoUrl ? (
              <VideoPlayer
                src={selectedLecture?.videoUrl}
                lectureId={selectedLecture?._id}
                courseId={courseId}
                onProgressUpdate={handleProgressUpdate}
                className="w-full h-full"
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

          {/* Questions Section */}
          {selectedLecture && (
            <LectureQuestionSection
              lectureId={selectedLecture._id}
              courseId={courseId}
              courseCreatorId={
                selectedCourse?.creator?._id || selectedCourse?.creator
              }
            />
          )}
        </div>

        {/* right sidebar */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              All Lectures
            </h2>

            <div className="mt-2">
              <span
                className={`px-3 py-1 mb-5 flex text-sm font-medium rounded-full ${selectedCourse?.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
                  }`}
              >
                Status:{" "}
                {selectedCourse?.status?.charAt(0).toUpperCase() +
                  selectedCourse?.status?.slice(1) || "Ongoing"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {selectedCourse?.lectures?.length > 0 ? (
              selectedCourse?.lectures?.map((lecture, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedLecture(lecture)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition text-left ${selectedLecture?._id === lecture._id
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

          {/* Assignment Button */}
          {assignment && (
            <div className="mb-6">
              {!hasSubmitted ? (
                <button
                  onClick={() => allLecturesCompleted && setShowAttempt(true)}
                  disabled={!allLecturesCompleted}
                  className={`w-full px-5 py-3 rounded-md transition font-medium text-sm ${allLecturesCompleted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                >
                  📝 Attempt Assignment
                </button>
              ) : (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    ✓ Assignment Submitted
                  </p>
                  <p className="text-xs text-green-700">
                    Score: {submissionScore?.score}/{submissionScore?.totalQuestions} ({submissionScore?.percentage}%)
                  </p>
                </div>
              )}
              {!allLecturesCompleted && (
                <p className="text-xs text-orange-600 mt-2 text-center font-medium">
                  ⚠️ Complete all lectures to unlock assignment
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 text-center">
                {assignment.questions?.length} questions available
              </p>
            </div>
          )}

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

                <p className="text-sm text-gray-600">
                  {creatorData?.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignment && assignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                Course Assignment
              </h2>

              <button
                onClick={() => setShowAssignment(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {assignment.questions?.map((q, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-5 bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Question {index + 1}: {q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                      >
                        <span className="font-semibold text-gray-700">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>

                        <span className="text-gray-800">
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setShowAssignment(false)}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Attempt Modal */}
      {showAttempt && assignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                📝 Assignment - Attempt
              </h2>
              <button
                onClick={() => setShowAttempt(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {assignment.questions?.map((q, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-5 bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Question {index + 1}: {q.question}
                  </h3>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition ${selectedAnswers[q._id] === option
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q._id}`}
                          value={option}
                          checked={selectedAnswers[q._id] === option}
                          onChange={() => handleAnswerSelect(q._id, option)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="font-medium text-gray-700">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between items-center rounded-b-2xl">
              <p className="text-sm text-gray-600">
                Answer all {assignment.questions?.length} questions before submitting
              </p>
              <button
                onClick={handleSubmitAssignment}
                className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
              >
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewLectures;
