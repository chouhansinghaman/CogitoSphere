import Project from "../models/Project.js";
import { v2 as cloudinary } from 'cloudinary';

// --- CLOUDINARY CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. CREATE PROJECT (With Image Upload) ---
export const createProject = async (req, res) => {
  try {
    const { 
        title, 
        shortDescription, 
        blogContent, 
        techStack, 
        githubLink, 
        liveDemoLink, 
        videoLink 
    } = req.body;

    // Validation
    if (!liveDemoLink) {
        return res.status(400).json({ message: "Live Demo Link is required!" });
    }

    let imageUrl = "";

    // Handle Cloudinary Upload from Buffer
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "season0-projects",
        });
        imageUrl = result.secure_url;
    }

    // Create Entry
    const project = await Project.create({
      title,
      shortDescription,
      blogContent,
      techStack: techStack ? techStack.split(",").map(t => t.trim()) : [],
      githubLink,
      liveDemoLink,
      videoLink,
      image: imageUrl,
      user: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- 2. GET ALL PROJECTS ---
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate("user", "name avatar")
            .sort({ createdAt: -1 }); // Newest first
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. GET SINGLE PROJECT ---
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate("user", "name avatar");
        if(project) {
            res.json(project);
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. LIKE PROJECT ---
export const likeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if(project) {
            // If logged in, use ID. If guest, use IP (or simple increment if you prefer)
            const likerId = req.user ? req.user._id.toString() : req.ip; 
            
            // Check if already liked
            if(!project.likes.includes(likerId)){
                project.likes.push(likerId);
                await project.save();
            }
            res.json(project);
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 5. DELETE PROJECT ---
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (project) {
            // Check ownership or admin status
            if (project.user.toString() === req.user._id.toString() || req.user.role === 'admin') {
                await project.deleteOne();
                res.json({ message: "Project removed" });
            } else {
                res.status(401).json({ message: "Not authorized" });
            }
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 6. RESTORED: SET PROJECT RANK ---
// (Used by Admins to assign Season Ranks: 0, 1, 2, 3)
export const setProjectRank = async (req, res) => {
    try {
        const { rank } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            project.seasonRank = rank;
            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};