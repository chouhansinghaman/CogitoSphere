import express from "express";
import { getLeaderboard, removeStudentLeaderboard } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getLeaderboard); // public leaderboard
router.delete("/user/:studentId", protect, adminOnly, removeStudentLeaderboard); // admin only

export default router;
