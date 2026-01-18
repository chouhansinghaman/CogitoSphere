import express from "express";
import { createProject, getProjects, setProjectRank } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadProjectImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, uploadProjectImage, createProject)
  .get(protect, getProjects);

router.put("/:id/rank", protect, adminOnly, setProjectRank);

export default router;