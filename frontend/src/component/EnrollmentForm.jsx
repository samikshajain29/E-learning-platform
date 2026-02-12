import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const EnrollmentForm = ({ isOpen, onClose, onSubmit, loading, userData }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        dateOfBirth: "",
        education: "",
    });

    // Auto-fill name and email from userData when modal opens
    useEffect(() => {
        if (isOpen && userData) {
            setFormData((prev) => ({
                ...prev,
                name: userData.name || "",
                email: userData.email || "",
            }));
        }
    }, [isOpen, userData]);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Phone validation (10 digits)
        if (!formData.phone) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be 10 digits";
        }

        // Address validation
        if (!formData.address || formData.address.trim().length < 5) {
            newErrors.address = "Please enter a valid address (min 5 characters)";
        }

        // City validation
        if (!formData.city || formData.city.trim().length < 2) {
            newErrors.city = "Please enter a valid city name";
        }

        // State validation
        if (!formData.state || formData.state.trim().length < 2) {
            newErrors.state = "Please enter a valid state";
        }

        // Zip code validation (6 digits)
        if (!formData.zipCode) {
            newErrors.zipCode = "Zip code is required";
        } else if (!/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = "Zip code must be 6 digits";
        }

        // Date of birth validation
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        } else {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 10 || age > 100) {
                newErrors.dateOfBirth = "Please enter a valid date of birth";
            }
        }

        // Education validation
        if (!formData.education) {
            newErrors.education = "Please select your education level";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Complete Your Enrollment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={loading}
                    >
                        <IoClose size={28} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Please provide your details to complete the enrollment process.
                        This information helps us serve you better.
                    </p>

                    {/* Student Name (Auto-filled, Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Your name"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                    </div>

                    {/* Student Email (Auto-filled, Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Your email"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit phone number"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.phone ? "border-red-500" : "border-gray-300"
                                }`}
                            maxLength="10"
                            disabled={loading}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            rows="2"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.address ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.city ? "border-red-500" : "border-gray-300"
                                    }`}
                                disabled={loading}
                            />
                            {errors.city && (
                                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Enter state"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.state ? "border-red-500" : "border-gray-300"
                                    }`}
                                disabled={loading}
                            />
                            {errors.state && (
                                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                            )}
                        </div>
                    </div>

                    {/* Zip Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            placeholder="Enter 6-digit zip code"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.zipCode ? "border-red-500" : "border-gray-300"
                                }`}
                            maxLength="6"
                            disabled={loading}
                        />
                        {errors.zipCode && (
                            <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                                }`}
                            max={new Date().toISOString().split("T")[0]}
                            disabled={loading}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                        )}
                    </div>

                    {/* Education */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Education Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${errors.education ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading}
                        >
                            <option value="">Select your education level</option>
                            <option value="High School">High School</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.education && (
                            <p className="text-red-500 text-xs mt-1">{errors.education}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentForm;
