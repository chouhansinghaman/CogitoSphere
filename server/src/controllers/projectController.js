import Project from "../models/Project.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Helper: Upload Buffer to Cloudinary
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "cogito_projects" }, // Folder name in Cloudinary
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const createProject = async (req, res) => {
  try {
    // 1. Extract new fields
    const { 
        title, 
        shortDescription, 
        blogContent, 
        techStack, 
        githubLink, 
        liveDemoLink, 
        videoLink 
    } = req.body;

    // 2. Validate Compulsory Live Link
    if (!liveDemoLink) {
        return res.status(400).json({ message: "Live Demo Link is required!" });
    }

    let image = "";
    if (req.file) {
      // Assuming you have cloudinary or local upload logic here
      image = req.file.path; 
    }

    // 3. Create
    const project = await Project.create({
      title,
      shortDescription,
      blogContent,
      techStack: techStack.split(",").map(t => t.trim()), // Ensure array
      githubLink,
      liveDemoLink,
      videoLink,
      image,
      user: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all projects (For Dashboard)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // .populate("user") fetches the name/email of the student who posted it
    const projects = await Project.find({}).populate("user", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not fetch projects" });
  }
};

// @desc    Admin: Assign Rank (1, 2, 3) to a project
// @route   PUT /api/projects/:id/rank
// @access  Private/Admin
export const setProjectRank = async (req, res) => {
  try {
    const { rank } = req.body; // Expects 0, 1, 2, or 3
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // If we are setting a rank (1, 2, 3), remove this rank from any other project first
    // (Only one Gold, one Silver, one Bronze allowed)
    if (rank > 0) {
      await Project.updateMany(
        { seasonRank: rank }, // Find others with this rank
        { $set: { seasonRank: 0 } } // Reset them to 0
      );
    }

    project.seasonRank = rank;
    await project.save();

    res.json({ message: `Project rank set to ${rank}`, project });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};