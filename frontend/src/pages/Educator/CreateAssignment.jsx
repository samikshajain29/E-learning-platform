import axios from "axios";
import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../App";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

function CreateAssignment() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Initialize 10 questions with empty fields
    const [questions, setQuestions] = useState(
        Array(10).fill(null).map((_, index) => ({
            question: "",
            options: ["", "", "", ""],
            correctAnswer: "",
        }))
    );

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
    };

    const handleCorrectAnswerChange = (questionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].correctAnswer = value;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async () => {
        // Validate all questions are filled
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].question.trim()) {
                toast.error(`Question ${i + 1} is empty`);
                return;
            }
            for (let j = 0; j < 4; j++) {
                if (!questions[i].options[j].trim()) {
                    toast.error(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty`);
                    return;
                }
            }
            if (!questions[i].correctAnswer) {
                toast.error(`Question ${i + 1} must have a correct answer selected`);
                return;
            }
        }

        setLoading(true);
        try {
            const result = await axios.post(
                serverUrl + `/api/course/assignment/${courseId}`,
                { questions },
                { withCredentials: true }
            );
            console.log(result.data);
            toast.success("Assignment uploaded successfully!");
            navigate(`/createlecture/${courseId}`);
        } catch (error) {
            console.log(error);
            setLoading(false);
            toast.error(error.response?.data?.message || "Failed to upload assignment");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <FaArrowLeftLong
                        className="w-[24px] h-[24px] cursor-pointer text-gray-700 hover:text-black"
                        onClick={() => navigate(`/createlecture/${courseId}`)}
                    />
                    <h1 className="text-3xl font-bold text-gray-800">Create Course Assignment</h1>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong> Create an assignment with exactly 10 MCQ questions.
                        Each question must have 4 options. This assignment will be visible to all students
                        enrolled in the course.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Question {qIndex + 1}
                            </h3>

                            {/* Question Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Text *
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Enter question ${qIndex + 1}`}
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                                />
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {q.options.map((option, optIndex) => (
                                    <div key={optIndex}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Option {String.fromCharCode(65 + optIndex)} *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Correct Answer Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correct Answer *
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                    value={q.correctAnswer}
                                    onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                                >
                                    <option value="">Select the correct answer</option>
                                    {q.options.map((option, optIndex) => (
                                        option.trim() && (
                                            <option key={optIndex} value={option}>
                                                {String.fromCharCode(65 + optIndex)}. {option}
                                            </option>
                                        )
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        className="px-6 py-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                        onClick={() => navigate(`/createlecture/${courseId}`)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-8 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ClipLoader size={24} color="white" />
                        ) : (
                            "Upload Assignment"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateAssignment;
