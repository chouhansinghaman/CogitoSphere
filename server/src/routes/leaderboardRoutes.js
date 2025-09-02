import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", getLeaderboard); // public leaderboard

export default router;
