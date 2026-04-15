import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { serverUrl } from "../App";

function ApplyEducator() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    contact: "",
    qualification: "",
    experience: "",
    skills: "",
    subjects: "",
    bio: "",
    reason: "",
    portfolio: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        e.target.value = null; // Clear
        setIdProof(null);
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid JPG, PNG, or PDF file.");
        e.target.value = null;
        setIdProof(null);
        return;
      }
      setIdProof(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields manually if HTML validation is bypassed
    if (!formData.contact || !formData.qualification || !formData.experience || !formData.skills || !formData.subjects || !formData.bio || !formData.reason) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!idProof) {
      toast.error("Please upload a valid ID proof.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("idProof", idProof);

    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/api/educator-request`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message || "Application submitted successfully.");
      setLoading(false);
      navigate("/"); // Redirect to home or dashboard after success
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || "Failed to submit request.";
      toast.error(msg);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex justify-center py-10 px-4 mt-[60px]">
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

          {/* Portfolio */}
          <div className="flex flex-col gap-1">
            <label htmlFor="portfolio" className="font-semibold text-sm">Portfolio/LinkedIn URL (Optional)</label>
            <input
              type="url"
              id="portfolio"
              className="border p-2 rounded-md focus:border-black outline-none"
              placeholder="https://linkedin.com/in/username"
              value={formData.portfolio}
              onChange={handleInputChange}
            />
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

          {/* Reason */}
          <div className="flex flex-col gap-1">
            <label htmlFor="reason" className="font-semibold text-sm">Why do you want to become an educator? <span className="text-red-500">*</span></label>
            <textarea
              id="reason"
              rows={3}
              className="border p-2 rounded-md focus:border-black outline-none resize-none"
              placeholder="Explain your motivation..."
              value={formData.reason}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          {/* ID Proof */}
          <div className="flex flex-col gap-1">
            <label htmlFor="idProof" className="font-semibold text-sm">Valid ID Proof (PDF/JPG/PNG, Max: 2MB) <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="idProof"
              accept=".jpg,.jpeg,.png,.pdf"
              className="border p-2 rounded-md focus:border-black outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
              onChange={handleFileChange}
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
