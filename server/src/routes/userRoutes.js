// routes/userRoutes.js

import express from "express";
import {
  getUserProfile,
  updateUser,          // <-- USE updateUser instead of updateUserName
  deleteUser,
  makeUserAdmin,
  updateUserAvatar,    // <-- NEW
  handleCheckIn,       // <-- NEW
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js"; // <-- NEW

const router = express.Router();

// User Profile Routes
router.get("/profile", protect, getUserProfile);
router.delete("/delete", protect, deleteUser);
router.put("/update", protect, updateUser);  // <-- FIXED

// Admin Route
router.post("/make-admin", protect, makeUserAdmin);

// New Routes
router.put("/avatar", protect, uploadSingleImage, updateUserAvatar);
router.post("/check-in", protect, handleCheckIn);

export default router;
