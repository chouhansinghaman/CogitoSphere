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
// 👇 Import your new unified middleware
import { uploadProjectImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- ROUTES ---

// Root: Get All & Create New (Uses uploadProjectImage)
router.route("/")
  .get(getProjects)
  .post(protect, uploadProjectImage, createProject); 

// Single Project Operations
router.route("/:id")
  .get(getProjectById)
  .delete(protect, deleteProject); 

// Like Project
router.route("/:id/like")
  .put(likeProject); 

// Admin Rank
router.route("/:id/rank")
  .put(protect, admin, setProjectRank);

export default router;