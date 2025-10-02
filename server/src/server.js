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

dotenv.config();
connectDB();

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware — must be BEFORE routes
app.use(cors({
  // Use the origin list from your most recent changes
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL // Vercel frontend URL for production
  ].filter(Boolean), // removes undefined if FRONTEND_URL is not set

  // Add these for good measure from the other version
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  
  // Keep credentials as false, as you intended for bearer tokens
  credentials: false 
}));

// Parse JSON
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/questions", questionRoutes);
app.use("/submissions", submissionRoutes);
app.use("/quizzes", quizRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);
app.use("/courses", courseRoutes);
app.use("/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => res.send("🎓 Scholarsphere Backend is running..."));

// Listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
