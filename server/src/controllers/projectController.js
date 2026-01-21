import Project from "../models/Project.js";
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. UPDATE: CREATE PROJECT ---
export const createProject = async (req, res) => {
  try {
    console.log("🚀 CONTROLLER: Starting Create Project");
    
    // 👇 Destructure teamMembers from body
    const { title, tagline, shortDescription, blogContent, techStack, githubLink, liveDemoLink, videoLink, teamMembers } = req.body;

    let imageUrl = "";
    if (req.file) {
        // ... (Keep existing Cloudinary logic) ...
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.upGridGlitchGame.upload(dataURI, { folder: "season0-projects" });
        imageUrl = result.secure_url;
    }

    // 🚨 PARSE TEAM MEMBERS
    // Since we are using FormData (multipart/form-data), arrays usually come as JSON strings.
    // We need to parse it back into a JavaScript Array.
    let membersArray = [];
    if (teamMembers) {
        try {
            membersArray = JSON.parse(teamMembers);
        } catch (e) {
            console.error("Error parsing teamMembers:", e);
            membersArray = []; // Fallback to empty if invalid
        }
    }

    const newProject = new Project({
      title,
      tagline,
      shortDescription,
      blogContent,
      techStack: techStack ? techStack.split(",").map(t => t.trim()) : [],
      githubLink,
      liveDemoLink,
      videoLink,
      image: imageUrl,
      user: req.user._id,
      teamMembers: membersArray // 👈 SAVE THE TEAM
    });

    const savedProject = await newProject.save();
    
    // Populate User AND Team Members for the response
    await savedProject.populate("user", "name avatar");
    await savedProject.populate("teamMembers", "name avatar"); // 👈 POPULATE TEAM

    res.status(201).json(savedProject);

  } catch (error) {
    console.error("🔥 CONTROLLER ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- 2. UPDATE: GET ALL PROJECTS ---
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate("user", "name avatar") 
            .populate("teamMembers", "name avatar")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. UPDATE: GET PROJECT BY ID ---
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("user", "name avatar")
            .populate("teamMembers", "name avatar");
            
        if(project) {
            res.json(project);
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. DELETE PROJECT (Updated with Admin/Owner Logic) ---
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 🛡️ SECURITY CHECK:
        // Allow delete if:
        // 1. The logged-in user is the owner (project.user matches req.user._id)
        // 2. OR The logged-in user is an 'admin'
        if (project.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this project" });
        }

        await project.deleteOne();
        console.log(`🗑️ Project deleted by ${req.user.name} (${req.user.role})`);
        res.json({ message: "Project removed" });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 5. LIKE PROJECT ---
export const likeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if(project) {
            const likerId = req.user ? req.user._id.toString() : req.ip; 
            
            // Toggle Like (Prevent duplicates)
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

// --- 6. SET PROJECT RANK (Admin Only) ---
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

