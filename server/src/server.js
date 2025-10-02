import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",        // Local dev
  "http://127.0.0.1:5173",       // Local dev alternative
  process.env.FRONTEND_URL        // Production frontend
].filter(Boolean);

// CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/notifications", notificationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🎓 Scholarsphere Backend is running...");
});

// Server Listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
