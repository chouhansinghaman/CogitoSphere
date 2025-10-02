import express from "express";
import {
  submitQuiz,
  getMySubmissions,
  getQuizSubmissions,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Student: Submits a quiz
router.post("/:quizId", protect, submitQuiz);

// Student: Gets their own submission history
router.get("/my", protect, getMySubmissions);

// Admin: Gets all submissions for a single quiz
router.get("/quiz/:quizId", protect, adminOnly, getQuizSubmissions);

export default router;