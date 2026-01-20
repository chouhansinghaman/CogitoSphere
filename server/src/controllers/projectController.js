import Project from "../models/Project.js";
import { v2 as cloudinary } from 'cloudinary';

// --- CLOUDINARY CONFIG ---
// Ensure your .env file has these keys!
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("❌ ERROR: Cloudinary keys are missing in .env file!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. CREATE PROJECT (With Image Upload) ---
export const createProject = async (req, res) => {
  try {
    console.log("🚀 STARTING PROJECT UPLOAD..."); 
    // console.log("User:", req.user?._id); // Uncomment to debug User ID
    // console.log("Body:", req.body);      // Uncomment to see text fields

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

    // ✅ Handle Cloudinary Upload from Memory Buffer
    if (req.file) {
        console.log("📸 Image detected, uploading to Cloudinary...");
        
        // Convert buffer to Base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        try {
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "season0-projects", // Folder in Cloudinary
            });
            imageUrl = result.secure_url;
            console.log("✅ Image Upload Success:", imageUrl);
        } catch (uploadError) {
            console.error("❌ Cloudinary Error:", uploadError);
            return res.status(500).json({ message: "Image Upload Failed", error: uploadError.message });
        }
    }

    // Create Entry in Database
    console.log("💾 Saving to Database...");
    
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

    console.log("🎉 Project Created Successfully!");
    res.status(201).json(project);

  } catch (error) {
    console.error("🔥 CONTROLLER CRASH:", error);
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
            // Use User ID if logged in, otherwise IP address for guests
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

// --- 5. DELETE PROJECT ---
// backend/controllers/projectController.js

export const deleteProject = async (req, res) => {
    try {
        console.log(`🗑️ ATTEMPTING DELETE: ${req.params.id}`);
        console.log(`👤 User requesting: ${req.user._id}, Role: ${req.user.role}`);

        // 1. Try to find the project
        const project = await Project.findById(req.params.id);
        
        // 2. If it doesn't exist, tell us LOUDLY
        if (!project) {
            console.log("❌ DELETE FAILED: Project ID not found in Database.");
            return res.status(404).json({ message: "Project ID not found in DB" });
        }

        console.log(`✅ Project Found: ${project.title}`);
        console.log(`👑 Owner: ${project.user}, Requestor: ${req.user._id}`);

        // 3. Check Permissions (Admin OR Owner)
        // We use .toString() to ensure we compare strings, not objects
        if (project.user.toString() === req.user._id.toString() || req.user.role === 'admin') {
            await project.deleteOne();
            console.log("🗑️ DELETE SUCCESSFUL");
            res.json({ message: "Project removed" });
        } else {
            console.log("⛔ DELETE BLOCKED: Not authorized");
            res.status(401).json({ message: "Not authorized" });
        }

    } catch (error) {
        console.error("🔥 DELETE CONTROLLER CRASH:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
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