import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    getWishlist,
    toggleWishlist,
    isWishlisted,
} from "../controllers/wishlistController.js";

const wishlistRouter = express.Router();

// All routes require authentication
wishlistRouter.use(isAuth);

// Toggle wishlist item (add/remove)
wishlistRouter.post("/toggle", toggleWishlist);

// Get all wishlist items for logged-in user
wishlistRouter.get("/", getWishlist);

// Check if a specific course is wishlisted
wishlistRouter.get("/check", isWishlisted);

export default wishlistRouter;