import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import quizAttemptRoutes from "./routes/quizAttemptRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// allow your frontend origin
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],// vite default; update if different
  credentials: false // we use bearer tokens, so no cookies
}));

// Middleware
app.use(express.json()); // allows parsing JSON in requests

// routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/posts", postRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🎓 Scholarsphere Backend is running...");
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
