import Project from "../models/Project.js";
import { v2 as cloudinary } from 'cloudinary'; // 👈 CRITICAL IMPORT

// Cloudinary Config (Ensure env vars are set in Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. CREATE PROJECT ---
export const createProject = async (req, res) => {
  try {
    console.log("🚀 CONTROLLER: Received Create Request");
    console.log("📦 Body:", req.body);

    const { 
        title, 
        tagline, 
        shortDescription, 
        blogContent, 
        techStack, 
        githubLink, 
        liveDemoLink, 
        videoLink, 
        teamMembers // Expecting JSON string
    } = req.body;

    // --- 1. IMAGE UPLOAD SAFETY CHECK ---
    let imageUrl = "";
    if (req.file) {
        try {
            console.log("📸 Uploading image to Cloudinary...");
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "season0-projects" });
            imageUrl = result.secure_url;
            console.log("✅ Image Uploaded:", imageUrl);
        } catch (uploadError) {
            console.error("❌ Cloudinary Error:", uploadError);
            return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
        }
    }

    // --- 2. TECH STACK SAFETY CHECK ---
    // Handle if techStack is undefined, null, or empty
    let techStackArray = [];
    if (techStack && typeof techStack === 'string') {
        techStackArray = techStack.split(",").map(t => t.trim());
    }

    // --- 3. TEAM MEMBERS SAFETY CHECK ---
    let membersArray = [];
    if (teamMembers) {
        try {
            membersArray = JSON.parse(teamMembers);
        } catch (e) {
            console.error("⚠️ Error parsing teamMembers, defaulting to empty:", e);
            membersArray = [];
        }
    }

    // --- 4. CREATE DATABASE ENTRY ---
    const newProject = new Project({
      title,
      tagline,
      shortDescription,
      blogContent,
      techStack: techStackArray,
      githubLink,
      liveDemoLink,
      videoLink,
      image: imageUrl,
      user: req.user._id, // Ensure authMiddleware is working
      teamMembers: membersArray 
    });

    const savedProject = await newProject.save();
    
    // Populate for immediate return
    await savedProject.populate("user", "name avatar");
    await savedProject.populate("teamMembers", "name avatar");

    console.log("🎉 Project Successfully Created:", savedProject._id);
    res.status(201).json(savedProject);

  } catch (error) {
    console.error("🔥 CRITICAL SERVER ERROR:", error);
    // Return the actual error message so you can see it in the Network Tab
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- 2. GET ALL PROJECTS ---
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate("user", "name avatar") 
            .populate("teamMembers", "name avatar")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error("Get Projects Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. GET SINGLE PROJECT ---
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
        console.error("Get Project Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. DELETE PROJECT ---
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await project.deleteOne();
        res.json({ message: "Project removed" });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 5. LIKE PROJECT ---
export const likeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if(project) {
            const likerId = req.user ? req.user._id.toString() : req.ip; 
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

// --- 6. RANK PROJECT ---
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