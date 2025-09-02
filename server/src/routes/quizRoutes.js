import express from "express";
import {
  createQuiz,
  getQuizzes,
  updateQuiz,
  getQuizById,    
  deleteQuiz,
} from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createQuiz);   // create quiz
router.get("/", getQuizzes);                    // fetch quizzes
router.get("/:id", getQuizById);
router.put("/:id", protect, adminOnly, updateQuiz); // update quiz
router.delete("/:id", protect, adminOnly, deleteQuiz); // delete quiz

export default router;
