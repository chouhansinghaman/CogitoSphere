import express from "express";
import {
  submitQuiz,
  getMySubmissions,
  getQuizSubmissions,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/:quizId", protect, submitQuiz);          // student submits attempt
router.get("/my", protect, getMySubmissions);          // student history
router.get("/quiz/:quizId", protect, adminOnly, getQuizSubmissions); // admin: see all attempts

export default router;
