// routes/userRoutes.js

import express from "express";
import {
  getUserProfile,
  updateUser,         
  deleteUser,
  makeUserAdmin,
  updateUserAvatar,  
  handleCheckIn,
  getAllUsers,
} from "../controllers/userController.js";

import { adminOnly } from "../middleware/adminMiddleware.js";
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

// Get All Users Route
router.get('/', protect, adminOnly, getAllUsers);

export default router;
