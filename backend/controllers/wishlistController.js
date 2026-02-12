import Wishlist from "../models/wishlistModel.js";
import Course from "../models/courseModel.js";

// Toggle wishlist item (add/remove)
export const toggleWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.userId;

        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if item already exists in wishlist
        const existingWishlistItem = await Wishlist.findOne({ userId, courseId });

        if (existingWishlistItem) {
            // Remove from wishlist
            await Wishlist.deleteOne({ _id: existingWishlistItem._id });
            return res.status(200).json({
                message: "Removed from wishlist",
                isWishlisted: false,
            });
        } else {
            // Add to wishlist
            const newWishlistItem = new Wishlist({ userId, courseId });
            await newWishlistItem.save();
            return res.status(201).json({
                message: "Added to wishlist",
                isWishlisted: true,
            });
        }
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all wishlist items for user
export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        const wishlistItems = await Wishlist.find({ userId })
            .populate({
                path: "courseId",
                populate: {
                    path: "creator",
                    select: "name photoUrl",
                },
            })
            .populate({
                path: "courseId",
                populate: {
                    path: "reviews",
                },
            })
            .sort({ createdAt: -1 });

        // Extract course data from populated results
        const courses = wishlistItems.map((item) => item.courseId);

        return res.status(200).json({
            message: "Wishlist fetched successfully",
            courses,
            count: courses.length,
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Check if a course is in user's wishlist
export const isWishlisted = async (req, res) => {
    try {
        const { courseId } = req.query;
        const userId = req.userId;

        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        const wishlistItem = await Wishlist.findOne({ userId, courseId });

        return res.status(200).json({
            isWishlisted: !!wishlistItem,
        });
    } catch (error) {
        console.error("Check wishlist error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};