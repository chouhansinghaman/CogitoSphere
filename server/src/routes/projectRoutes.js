import express from "express";
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  likeProject, 
  deleteProject, 
  setProjectRank 
} from "../controllers/projectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// --- 1. MULTER CONFIG (Memory Storage) ---
// This passes the file 'buffer' to the controller, where Cloudinary handles it.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- 2. PUBLIC & PROTECTED ROUTES ---

// Root: Get All & Create New
router.route("/")
  .get(getProjects) // Public: View all projects
  .post(protect, upload.single("image"), createProject); // Protected: Post new (with image)

// Single Project Operations
router.route("/:id")
  .get(getProjectById) // Public: View details
  .delete(protect, deleteProject); // Protected: Owner/Admin can delete

// Like Project
router.route("/:id/like")
  .put(likeProject); // Public/Protected mixed logic in controller (handles guests)

// --- 3. ADMIN ROUTES ---

// Set Season Rank (Admin Only)
router.route("/:id/rank")
  .put(protect, admin, setProjectRank);

export default router;