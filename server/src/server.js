import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js"; 
import projectRoutes from "./routes/projectRoutes.js"; 

dotenv.config();
connectDB();

const app = express();

// ---------------------
// ✅ CORS CONFIG (Fixed)
// ---------------------

const allowedOrigins = [
  "http://localhost:5173",          // local dev
  "http://127.0.0.1:5173",          // local dev
  process.env.FRONTEND_URL,         // production frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like Postman, curl, or mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Allow specific whitelisted origins (Localhost, Prod)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. ✅ Allow ALL GitHub Codespaces URLs
    // Using .endsWith is safer and cleaner than Regex for this case.
    if (origin.endsWith(".github.dev")) {
      return callback(null, true);
    }

    // 4. Block everything else
    console.log("🚫 Blocked by CORS. Origin:", origin);
    
    // Return 'false' to deny access without crashing the server (avoids 500 Error)
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS globally - this automatically handles Preflight (OPTIONS) requests
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// ---------------------
// ✅ ROUTES
// ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/projects", projectRoutes);

// --------------------------
// ✅ Serve React build
// --------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../../client/dist");

app.use(express.static(clientBuildPath));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --------------------------
// ✅ Start Server
// --------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));