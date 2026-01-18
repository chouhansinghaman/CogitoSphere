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
    const { title, description, techStack, githubLink, liveDemoLink } = req.body;

    let imageUrl = "https://via.placeholder.com/800x400?text=No+Image"; // Default

    // 👇 HANDLE IMAGE UPLOAD HERE
    if (req.file) {
      const result = await uploadFromBuffer(req.file.buffer);
      imageUrl = result.secure_url; // Get the URL from Cloudinary
    }

    const project = new Project({
      title,
      description,
      techStack: techStack.split(","), // Convert string "React, Node" to Array
      githubLink,
      liveDemoLink,
      image: imageUrl, // Save the Cloudinary URL
      user: req.user._id,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not create project" });
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