import express from "express";
import {
    addComment,
    createIdea,
    deleteIdea,
    getIdeas,
    joinIdea,
    leaveTeam,
    updateIdea
} from "../controllers/ideaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. General Routes
router.route("/")
    .get(getIdeas)
    .post(protect, createIdea);

// 2. Team Actions (CRITICAL FIXES HERE)
router.put("/:id/join", protect, joinIdea);
router.put("/:id/leave", protect, leaveTeam);

// 3. Comments
router.post('/:id/comment', protect, addComment);

// 4. Single Idea Management
router.route("/:id")
    .put(protect, updateIdea)
    .delete(protect, deleteIdea);

export default router;