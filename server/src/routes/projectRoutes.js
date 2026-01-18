import express from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createProject) // Create (Needs Login)
  .get(protect, getProjects);   // Read (Needs Login)

export default router;