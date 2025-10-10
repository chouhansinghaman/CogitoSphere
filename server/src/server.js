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
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ---------------------
// ✅ CORS CONFIG
// ---------------------

const allowedOrigins = [
  "http://localhost:5173",          // local dev
  "http://127.0.0.1:5173",         // local dev
  process.env.FRONTEND_URL,        // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests from Postman, curl, or server-to-server calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// **Handle OPTIONS preflight for all routes**
app.options("*", cors()); // very important for POST/PUT with headers

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
app.use("/api/posts", postRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/notifications", notificationRoutes);

// --------------------------
// ✅ Serve React build
// --------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../../client/dist");

app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --------------------------
// ✅ Start Server
// --------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
