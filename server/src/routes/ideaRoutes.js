import express from "express";
import { createIdea, getIdeas, joinIdea } from "../controllers/ideaController.js";
import { protect } from "../middleware/authMiddleware.js"; // Reuse your existing middleware

const router = express.Router();

// All idea routes are protected (must be logged in)
router.route("/")
    .get(protect, getIdeas)
    .post(protect, createIdea);

router.post("/:id/join", protect, joinIdea);

export default router;