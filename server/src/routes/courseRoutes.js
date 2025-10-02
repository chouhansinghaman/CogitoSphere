import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single('pdfFile'), createCourse);
router.put("/:id", protect, adminOnly, upload.single('pdfFile'), updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;