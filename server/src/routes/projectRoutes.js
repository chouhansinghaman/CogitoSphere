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
import { uploadProjectImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- 1. GENERAL ROUTES ---
// GET /api/projects   -> Fetch all projects
// POST /api/projects  -> Create new project (Needs Login + Image Upload)
router.route("/")
  .get(getProjects)
  .post(protect, uploadProjectImage, createProject);

// --- 2. SPECIFIC PROJECT ROUTES ---
// GET /api/projects/:id    -> View single project details
// DELETE /api/projects/:id -> Delete project (Owner or Admin only)
router.route("/:id")
  .get(getProjectById)
  .delete(protect, deleteProject);

// --- 3. INTERACTION ROUTES ---
// PUT /api/projects/:id/like -> Like a project
router.route("/:id/like")
  .put(likeProject);

// --- 4. ADMIN ROUTES ---
// PUT /api/projects/:id/rank -> Set official rank (Admin only)
router.route("/:id/rank")
  .put(protect, admin, setProjectRank);

export default router;