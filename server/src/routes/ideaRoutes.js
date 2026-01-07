import express from "express";
import { addComment, createIdea, deleteIdea, getIdeas, joinIdea, leaveTeam, updateIdea } from "../controllers/ideaController.js";
import { protect } from "../middleware/authMiddleware.js"; // Reuse your existing middleware

const router = express.Router();

// All idea routes are protected (must be logged in)
router.route("/")
    .get(protect, getIdeas)
    .post(protect, createIdea);
router.post("/:id/join", protect, joinIdea);
router.post('/:id/comment', protect, addComment);
router.put('/:id/leave', protect, leaveTeam);
router.delete('/:id', protect, deleteIdea);  
router.put('/:id', protect, updateIdea);

export default router;