import express from "express";
import { 
  createPost, 
  getPosts, 
  addAnswer, 
  deletePost // Import the new controller
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

// Get all posts (public)
router.get("/", getPosts);

// Create a new post (protected)
router.post("/", protect, createPost);

// Add an answer to a specific post (protected)
router.post("/:id/answer", protect, addAnswer);

// ✨ **NEW:** Delete a specific post (protected, logic inside controller)
router.delete("/:id", protect, deletePost);

export default router;