import express from "express";
import { attemptQuiz, getMyAttempts } from "../controllers/quizAttemptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:quizId", protect, attemptQuiz);
router.get("/my", protect, getMyAttempts);

export default router;
