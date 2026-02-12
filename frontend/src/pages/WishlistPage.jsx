import React, { useState, useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import Card from "../component/Card";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";

function WishlistPage() {
    const { userData } = useSelector((state) => state.user);
    const [wishlistCourses, setWishlistCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            fetchWishlist();
        }
    }, [userData]);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${serverUrl}/api/wishlist`, {
                withCredentials: true,
            });
            setWishlistCourses(response.data.courses);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            setError(error.response?.data?.message || "Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ClipLoader size={50} color="#000000" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchWishlist}
                        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <FaArrowLeftLong
                        className="text-black w-[22px] h-[22px] cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {wishlistCourses.length} courses
                    </span>
                </div>

                {/* Empty State */}
                {wishlistCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🤍</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start adding courses you're interested in!
                        </p>
                        <button
                            onClick={() => navigate("/allcourses")}
                            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    /* Course Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistCourses.map((course) => (
                            <Card
                                key={course._id}
                                id={course._id}
                                title={course.title}
                                category={course.category}
                                price={course.price}
                                thumbnail={course.thumbnail}
                                reviews={course.reviews}
                                creator={course.creator}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WishlistPage;