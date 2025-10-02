// routes/userRoutes.js

import express from "express";
import {
  getUserProfile,
  deleteUser,
  updateUserName,
  makeUserAdmin,
  updateUserAvatar, // <-- IMPORT NEW
  handleCheckIn,    // <-- IMPORT NEW
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js"; // <-- IMPORT NEW

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.delete("/delete", protect, deleteUser);
router.put("/update", protect, updateUserName);
router.post("/make-admin", protect, makeUserAdmin);

// New Routes
router.put("/avatar", protect, uploadSingleImage, updateUserAvatar); // <-- ADD THIS
router.post("/check-in", protect, handleCheckIn); // <-- ADD THIS

export default router;