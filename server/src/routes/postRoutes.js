import express from "express";
import { createPost, getPosts, addAnswer, votePost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.post("/:id/answer", protect, addAnswer);
router.put("/:id/vote", protect, votePost);

export default router;
