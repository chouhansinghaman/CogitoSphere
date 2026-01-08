// routes/userRoutes.js

import express from "express";
import {
  getUserProfile,
  updatePassword,
  deleteUser,
  makeUserAdmin,
  updateUserAvatar,
  handleCheckIn,
  getAllUsers,
  updateUserProfile,
  getPublicUserProfile,
} from "../controllers/userController.js";

import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- Profile Routes ---
router.get("/profile", protect, getUserProfile);
router.delete("/delete", protect, deleteUser);

// Update Profile (Name, Bio, Build Space)
router.put("/update", protect, updateUserProfile);

// ✅ ADDED: Password Update Route (Fixes the <DOCTYPE error)
router.put("/update-password", protect, updatePassword);

// --- Feature Routes ---
router.put("/avatar", protect, uploadSingleImage, updateUserAvatar);
router.post("/check-in", protect, handleCheckIn);

// --- Admin Routes ---
router.post("/make-admin", protect, makeUserAdmin);
router.get("/", protect, adminOnly, getAllUsers);

// --- Public Route ---
router.get("/public/:id", protect, getPublicUserProfile);

export default router;