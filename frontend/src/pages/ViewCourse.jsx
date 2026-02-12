import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setSelectedCourse } from "../redux/courseSlice";
import { useEffect } from "react";
import img from "../assets/empty.jpg";
import { FaStar } from "react-icons/fa6";
import { serverUrl } from "../App";
import { useState } from "react";
import { IoIosPlayCircle } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Card from "../component/Card";
import { ClipLoader } from "react-spinners";
import EnrollmentForm from "../component/EnrollmentForm";
import WishlistButton from "../component/WishlistButton";
function ViewCourse() {
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course); // publish course courseData ki array me h
  const { selectedCourse } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [creatorCourses, setCreatorCourses] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false); // Track if user has already reviewed

  const fetchCourseData = async () => {
    courseData.map((course) => {
      if (course._id === courseId) {
        dispatch(setSelectedCourse(course));
        console.log(selectedCourse);

        return null;
      }
    });
  };

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

  useEffect(() => {
    if (userData && selectedCourse?._id) {
      const verify = userData.enrolledCourses?.some(
        (c) =>
          (typeof c === "string" ? c : c._id).toString() ===
          selectedCourse._id.toString()
      );
      setIsEnrolled(verify);
    }
  }, [userData, selectedCourse]);

  useEffect(() => {
    fetchCourseData();
  }, [courseData, courseId]);

  useEffect(() => {
    if (creatorData?._id && courseData.length > 0) {
      const creatorCourse = courseData.filter(
        (course) =>
          (typeof course.creator === 'object' ? course.creator._id : course.creator)?.toString() === creatorData?._id?.toString() && course._id !== courseId
      );
      setCreatorCourses(creatorCourse);
    }
  }, [creatorData, courseData, courseId]);

  const handleEnroll = async (userId, courseId) => {
    // Show enrollment form modal
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentFormSubmit = async (formData) => {
    setLoading(true);
    setEnrollmentData(formData);

    try {
      const orderData = await axios.post(
        serverUrl + "/api/order/razorpay-order",
        { userId: userData._id, courseId },
        { withCredentials: true }
      );
      console.log(orderData);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "E-LEARNING",
        description: "COURSE ENROLLMENT PAYMENT",
        order_id: orderData.data.id,
        handler: async function (response) {
          console.log("RazorPay Response", response);
          try {
            const verifyPayment = await axios.post(
              serverUrl + "/api/order/verifypayment",
              {
                ...response,
                courseId,
                userId: userData._id,
                enrollmentData: formData // Include form data in verification
              },
              { withCredentials: true }
            );
            setIsEnrolled(true);
            setShowEnrollmentForm(false);
            setLoading(false);
            toast.success(verifyPayment.data.message);
          } catch (error) {
            setLoading(false);
            setShowEnrollmentForm(false);
            toast.error(error.response.data.message);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setShowEnrollmentForm(false);
            toast.info("Payment cancelled");
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
      setLoading(false);
      setShowEnrollmentForm(false);
      toast.error("Something went wrong while enrolling");
    }
  };

  const handleReview = async () => {
    // Check if user has already reviewed to show appropriate message
    if (hasReviewed) {
      toast.warning("You have already reviewed this course");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + "/api/review/createreview",
        {
          rating,
          comment,
          courseId,
        },
        { withCredentials: true }
      );
      setLoading(false);
      toast.success("Review Added");
      console.log(result.data);
      setRating(0);
      setComment("");
      setHasReviewed(true); // Set reviewed status to true after successful review
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response.data.message);
      setRating(0);
      setComment("");
    }
  };

  // Check if user has already reviewed this course
  useEffect(() => {
    if (userData?._id && selectedCourse?._id) {
      const checkExistingReview = async () => {
        try {
          // Check if user has already reviewed this course by looking at course reviews
          const existingReview = selectedCourse?.reviews?.find(
            review => review.user?._id?.toString() === userData._id.toString()
          );

          if (existingReview) {
            setHasReviewed(true);
          } else {
            setHasReviewed(false);
          }
        } catch (error) {
          console.error("Error checking existing review:", error);
        }
      };

      checkExistingReview();
    }
  }, [userData, selectedCourse]);

  const calculateAvgReview = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAvgReview(selectedCourse?.reviews);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Enrollment Form Modal */}
      <EnrollmentForm
        isOpen={showEnrollmentForm}
        onClose={() => {
          setShowEnrollmentForm(false);
          setLoading(false);
        }}
        onSubmit={handleEnrollmentFormSubmit}
        loading={loading}
        userData={userData}
      />

      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 relative">
        {/* top section */}

        <div className="flex flex-col md:flex-row gap-6">
          {/* thumbnail */}

          <div className="w-full md:w-1/2">
            <FaArrowLeftLong
              className="text-black w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/")}
            />

            <div className="relative">
              <WishlistButton courseId={courseId} className="top-4 right-4" />
              {selectedCourse?.thumbnail ? (
                <img
                  src={selectedCourse?.thumbnail}
                  className="rounded-xl w-full object-cover"
                />
              ) : (
                <img src={img} className="rounded-xl w-full object-cover" />
              )}
            </div>
          </div>

          {/* courseinfo */}

          <div className="flex-1 space-y-2 my-[20px]">
            <h2 className="text-2xl font-bold">{selectedCourse?.title}</h2>
            <p className="text-gray-600">{selectedCourse?.subTitle}</p>

            <div className="flex items-start flex-col justify-between">
              <div className="text-yellow-500 font-medium flex gap-2">
                <span className="flex items-center justify-start gap-1">
                  <FaStar />
                  {avgRating}
                </span>
                <span className="text-gray-400">
                  ({selectedCourse?.reviews.length} reviews)
                </span>
              </div>
              {/* //price */}
              <div>
                <span className="text-xl font-semibold text-black">
                  ₹{selectedCourse?.price}
                </span>{" "}
                <span className="line-through text-sm text-gray-400">
                  ₹2999
                </span>
              </div>

              <ul className="text-sm text-gray-700 space-y-1 pt-2">
                <li>✔️ 10+ hours of video content</li>
                <li>✔️ Lifetime access to course materials</li>
              </ul>

              {/* Conditional logic based on user role and course ownership */}
              {userData?.role === "educator" && selectedCourse?.creator?._id?.toString() === userData?._id?.toString() ? (
                // Educator viewing their own course: Show "Watch Now" directly without payment
                <button
                  className="bg-green-100 text-green-500 px-6 py-2 rounded hover:bg-gray-700 mt-3 cursor-pointer"
                  onClick={() => navigate(`/viewlecture/${courseId}`)}
                >
                  Watch Now
                </button>
              ) : userData?.role === "educator" ? (
                // Educator viewing another educator's course: Treat like a student
                !isEnrolled ? (
                  <button
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700 mt-3 cursor-pointer"
                    onClick={() => handleEnroll(userData._id, courseId)}
                  >
                    Enroll Now
                  </button>
                ) : (
                  <button
                    className="bg-green-100 text-green-500 px-6 py-2 rounded hover:bg-gray-700 mt-3 cursor-pointer"
                    onClick={() => navigate(`/viewlecture/${courseId}`)}
                  >
                    Watch Now
                  </button>
                )
              ) : (
                // Student: Show "Enroll Now" or "Watch Now" based on enrollment status
                !isEnrolled ? (
                  <button
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700 mt-3 cursor-pointer"
                    onClick={() => handleEnroll(userData._id, courseId)}
                  >
                    Enroll Now
                  </button>
                ) : (
                  <button
                    className="bg-green-100 text-green-500 px-6 py-2 rounded hover:bg-gray-700 mt-3 cursor-pointer"
                    onClick={() => navigate(`/viewlecture/${courseId}`)}
                  >
                    Watch Now
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Learn {selectedCourse?.category} from Beginning</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Who This Course is For</h2>
          <p className="text-gray-700">
            Beginners, aspiring developers, and professionals looking to upgrade
            skills.
          </p>
        </div>

        {/* lecture area */}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white w-full md:w-2/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-1 text-gray-800">
              Course Curriculum
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCourse?.lectures?.length} Lectures
            </p>

            <div className="flex flex-col gap-3">
              {selectedCourse?.lectures?.map((lec, index) => {
                // Determine if lecture should be accessible
                // Educator viewing own course: Always accessible
                // Educator viewing other's course: Same as student (enrolled or preview)
                // Student enrolled: Always accessible  
                // Student not enrolled: Only if isPreviewFree
                const isAccessible =
                  (userData?.role === "educator" && selectedCourse?.creator?._id?.toString() === userData?._id?.toString()) ||
                  isEnrolled ||
                  lec.isPreviewFree;

                return (
                  <button
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${isAccessible
                      ? "hover:bg-gray-100 cursor-pointer border-gray-300"
                      : "cursor-not-allowed opacity-60 border-gray-200"
                      } ${selectedLecture?.lectureTitle === lec.lectureTitle
                        ? "bg-gray-100 border-gray-400"
                        : ""
                      }`}
                    disabled={!isAccessible}
                    onClick={() => {
                      if (isAccessible) {
                        setSelectedLecture(lec);
                      }
                    }}
                  >
                    {" "}
                    <span className="text-lg text-gray-700">
                      {isAccessible ? <IoIosPlayCircle /> : <FaLock />}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {lec.lectureTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* right div */}
          <div className="bg-white w-full md:w-3/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-black flex items-center justify-center">
              {selectedLecture?.videoUrl ? (
                <video
                  className="w-full h-full object-contain"
                  src={selectedLecture?.videoUrl}
                  controls
                />
              ) : (
                <span className="text-white text-sm">
                  Select a preview lecture to watch
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Show review section only if user has access to "Watch Now" */}
        {(userData?.role === "educator" && selectedCourse?.creator?._id?.toString() === userData?._id?.toString()) || isEnrolled ? (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">Write a Review</h2>

            {hasReviewed ? (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-700">You have already submitted a review for this course.</p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      onClick={() => setRating(star)}
                      className={
                        star <= rating ? "fill-amber-300" : "fill-gray-300"
                      }
                    />
                  ))}
                </div>
                <textarea
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Write your review here..."
                  rows={3}
                />
                <button
                  className={`${hasReviewed
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                    } mt-3 px-4 py-2 rounded`}
                  disabled={loading || hasReviewed}
                  onClick={handleReview}
                >
                  {loading ? (
                    <ClipLoader size={30} color="white" />
                  ) : hasReviewed ? (
                    "Already Reviewed"
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 border-t pt-6">
            <p className="text-gray-600 italic">You must be enrolled in this course to submit a review.</p>
          </div>
        )}

        {/* For creator info */}
        <div className="flex items-center gap-4 pt-4 border-t">
          {creatorData?.photoUrl ? (
            <img
              src={creatorData?.photoUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-1 border-gray-200"
            />
          ) : (
            <img
              src={img}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-1 border-gray-200"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">{creatorData?.name}</h2>
            <p className="md:text-sm text-gray-600 text-[10px]">
              {creatorData?.description}
            </p>
            <p className="md:text-sm text-gray-600 text-[10px]">
              {creatorData?.email}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xl font-semibold mb-2">
            Other Published Courses by the Educator -
          </p>
        </div>

        <div className="w-full transition-all duration-300 py-[20px] flex items-start justify-center lg:justify-start flex-wrap gap-6 lg:px-[80px]">
          {creatorCourses?.map((course, index) => (
            <Card
              key={index}
              thumbnail={course.thumbnail}
              id={course._id}
              price={course.price}
              title={course.title}
              category={course.category}
              reviews={course.reviews}
              creator={course.creator}  // Pass creator information
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;