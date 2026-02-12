import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function VideoPlayer({
    src,
    lectureId,
    courseId,
    onProgressUpdate,
    className = ""
}) {
    const videoRef = useRef(null);
    const { userData } = useSelector((state) => state.user);
    const [watchedPercentage, setWatchedPercentage] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasSentCompletion, setHasSentCompletion] = useState(false);

    // Track video progress
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (!video.duration) return;

            const percentage = (video.currentTime / video.duration) * 100;
            setWatchedPercentage(Math.round(percentage));

            // Only send completion once when reaching 100%
            if (percentage >= 100 && !hasSentCompletion) {
                setHasSentCompletion(true);
                handleVideoCompletion();
            }
        };

        const handleSeeked = () => {
            // Reset completion flag if user seeks back
            if (video.currentTime < video.duration * 0.95) {
                setHasSentCompletion(false);
            }
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, [hasSentCompletion, lectureId, courseId]);

    const handleVideoCompletion = async () => {
        if (!userData || !lectureId || !courseId) {
            return;
        }

        try {
            const response = await axios.post(
                `${serverUrl}/api/progress/update`,
                {
                    courseId,
                    lectureId,
                    watchedPercentage: 100
                },
                { withCredentials: true }
            );

            setIsCompleted(true);

            if (response.data.isCompleted) {
                toast.success("Lecture completed! 🎉");
            }

            // Notify parent component
            if (onProgressUpdate) {
                onProgressUpdate({
                    lectureId,
                    completed: true,
                    percentage: 100
                });
            }
        } catch (error) {
            console.error("Error updating progress:", error);
            // Don't show toast for partial watching
            if (error.response?.data?.message?.includes("watched < 100%")) {
                return;
            }
            toast.error(error.response?.data?.message || "Failed to update progress");
        }
    };

    return (
        <video
            ref={videoRef}
            src={src}
            className={`w-full h-full object-contain ${className}`}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
        >
            Your browser does not support the video tag.
        </video>
    );
}

export default VideoPlayer;