import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { serverUrl } from "../App";
import { FaArrowLeftLong } from "react-icons/fa6";
import { setUserData } from "../redux/userSlice.js";

function ApplyEducator() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    contact: "",
    currentRole: "",
    qualification: "",
    experience: "",
    skills: "",
    subjects: "",
    bio: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [resume, setResume] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appStatus, setAppStatus] = useState("loading");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/educator/status`, {
          withCredentials: true,
        });
        setAppStatus(res.data.status);
      } catch (error) {
        setAppStatus("error");
      }
    };
    fetchStatus();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e, setFile, validTypes, maxMb) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`File size should be less than ${maxMb}MB`);
        e.target.value = null; // Clear
        setFile(null);
        return;
      }
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid file type.");
        e.target.value = null;
        setFile(null);
        return;
      }
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields manually
    if (!formData.contact || !formData.qualification || !formData.experience || !formData.skills || !formData.subjects || !formData.bio) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (formData.contact.length < 10 || formData.contact.length > 15) {
      toast.error("Contact number must be between 10 and 15 digits.");
      return;
    }

    if (!idProof) {
      toast.error("Please upload a valid ID proof.");
      return;
    }
    if (!resume) {
      toast.error("Please upload your Resume/CV.");
      return;
    }
    if (!profileImage) {
      toast.error("Please upload your Profile Picture.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("idProof", idProof);
    data.append("resume", resume);
    data.append("profileImage", profileImage);

    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/api/educator/apply`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message || "Your educator application has been submitted successfully and is under review.");
      setLoading(false);
      setAppStatus("pending");
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || "Failed to submit request.";
      toast.error(msg);
      console.log(error);
    }
  };

  if (appStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex justify-center items-center">
        <ClipLoader size={50} color="black" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login")
      console.log(result.data);
      toast.success("Logout Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  if (appStatus !== "none" && appStatus !== "error") {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex justify-center py-20 px-4 mt-[60px]">
        <div className="bg-white max-w-[600px] w-full p-10 shadow-xl rounded-2xl flex flex-col items-center gap-4 text-center">
          {/* <FaArrowLeftLong
            className="absolute top-[16%] left-[5%] w-[22px] h-[22px] cursor-pointer"
            onClick={() => navigate("/")}
          /> */}
          <h1 className="text-3xl font-bold text-black mb-2">Application Status</h1>
          <div className={`text-xl font-semibold capitalize ${appStatus === "pending" ? "text-yellow-600" : appStatus === "approved" ? "text-green-600" : "text-red-600"}`}>
            Status: {appStatus}
          </div>
          <p className="text-gray-500">
            {appStatus === "pending" ? "Your application is currently under review by our administration team. We'll update you soon."
              : appStatus === "approved" ? "Your application has been approved! You can now access your educator dashboard."
                : "Your application was unfortunately rejected at this time."}
          </p>
          {/* <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Go back to Home
          </button> */}
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Logout
          </button>

        </div>
      </div>
    );
  }

  if (userData?.hasAppliedForEducator && appStatus === "none") {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex justify-center py-20 px-4 mt-[60px]">
        <div className="bg-white max-w-[600px] w-full p-10 shadow-xl rounded-2xl flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Verified Educator</h1>
          <p className="text-gray-500">You are already a verified educator on our platform.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex justify-center py-10 px-4 mt-[60px]">
      {/* <FaArrowLeftLong
        className="absolute top-[16%] left-[5%] w-[22px] h-[22px] cursor-pointer"
        onClick={() => navigate("/login")}
      /> */}
      <div className="bg-white max-w-[800px] w-full p-8 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-2">Request for Educator</h1>
        <p className="text-center text-gray-500 mb-8">Fill out the form below to apply as an educator.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold text-sm">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                className="border p-2 rounded-md bg-gray-100"
                value={formData.name}
                readOnly
              />
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-semibold text-sm">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                id="email"
                className="border p-2 rounded-md bg-gray-100"
                value={formData.email}
                readOnly
              />
            </div>
            {/* Contact Number */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact" className="font-semibold text-sm">Contact Number <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="contact"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. 9876543210"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Current Role */}
            <div className="flex flex-col gap-1">
              <label htmlFor="currentRole" className="font-semibold text-sm">Current Role / Profession (Optional)</label>
              <input
                type="text"
                id="currentRole"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. Software Engineer"
                value={formData.currentRole}
                onChange={handleInputChange}
              />
            </div>
            {/* Qualification */}
            <div className="flex flex-col gap-1">
              <label htmlFor="qualification" className="font-semibold text-sm">Highest Qualification <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="qualification"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. PhD in Computer Science"
                value={formData.qualification}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Experience */}
            <div className="flex flex-col gap-1">
              <label htmlFor="experience" className="font-semibold text-sm">Years of Experience <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="experience"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. 5"
                min="0"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Subjects/Courses */}
            <div className="flex flex-col gap-1">
              <label htmlFor="subjects" className="font-semibold text-sm">Subjects/Courses to Teach <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="subjects"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. Mathematics, Physics"
                value={formData.subjects}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Skills */}
            <div className="flex flex-col gap-1">
              <label htmlFor="skills" className="font-semibold text-sm">Skills (Comma separated) <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="skills"
                className="border p-2 rounded-md focus:border-black outline-none"
                placeholder="Ex. React, Node.js, Python"
                value={formData.skills}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label htmlFor="bio" className="font-semibold text-sm">Short Bio / About You <span className="text-red-500">*</span></label>
            <textarea
              id="bio"
              rows={3}
              className="border p-2 rounded-md focus:border-black outline-none resize-none"
              placeholder="Tell us a little bit about yourself..."
              value={formData.bio}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          {/* ID Proof */}
          <div className="flex flex-col gap-1">
            <label htmlFor="idProof" className="font-semibold text-sm">Valid ID Proof (PDF/JPG/PNG, Max: 5MB) <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="idProof"
              accept=".jpg,.jpeg,.png,.pdf"
              className="border p-2 rounded-md focus:border-black outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
              onChange={(e) => handleFileChange(e, setIdProof, ["image/jpeg", "image/png", "application/pdf"], 5)}
              required
            />
          </div>

          {/* Resume */}
          <div className="flex flex-col gap-1">
            <label htmlFor="resume" className="font-semibold text-sm">Resume/CV (PDF/JPG/PNG, Max: 5MB) <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="resume"
              accept=".jpg,.jpeg,.png,.pdf"
              className="border p-2 rounded-md focus:border-black outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
              onChange={(e) => handleFileChange(e, setResume, ["image/jpeg", "image/png", "application/pdf"], 5)}
              required
            />
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col gap-1">
            <label htmlFor="profileImage" className="font-semibold text-sm">Profile Picture (JPG/PNG, Max: 5MB) <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="profileImage"
              accept=".jpg,.jpeg,.png"
              className="border p-2 rounded-md focus:border-black outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
              onChange={(e) => handleFileChange(e, setProfileImage, ["image/jpeg", "image/png"], 5)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-11 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplyEducator;
