import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { serverUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function WishlistButton({ courseId, className = "" }) {
    const { userData } = useSelector((state) => state.user);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if course is already in wishlist on component mount
    useEffect(() => {
        if (userData && courseId) {
            checkWishlistStatus();
        }
    }, [userData, courseId]);

    const checkWishlistStatus = async () => {
        try {
            const response = await axios.get(
                `${serverUrl}/api/wishlist/check?courseId=${courseId}`,
                { withCredentials: true }
            );
            setIsWishlisted(response.data.isWishlisted);
        } catch (error) {
            console.error("Error checking wishlist status:", error);
        }
    };

    const handleToggleWishlist = async () => {
        if (!userData) {
            toast.error("Please login to add to wishlist");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${serverUrl}/api/wishlist/toggle`,
                { courseId },
                { withCredentials: true }
            );

            setIsWishlisted(response.data.isWishlisted);
            toast.success(response.data.message);
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!userData) {
        return null; // Don't show wishlist button for non-logged-in users
    }

    return (
        <button
            onClick={handleToggleWishlist}
            disabled={loading}
            className={`absolute top-3 right-3 z-10 ${className}`}
        >
            <FaHeart
                className={`w-6 h-6 transition-all duration-200 ${isWishlisted
                        ? "text-red-500 fill-current"
                        : "text-white/70 hover:text-red-400 hover:scale-110"
                    } ${loading ? "animate-pulse" : ""}`}
            />
        </button>
    );
}

export default WishlistButton;