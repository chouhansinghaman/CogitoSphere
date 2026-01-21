import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    // 1. Basic Info
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    
    // ✨ NEW: A catchy one-liner for the card
    tagline: { 
        type: String, 
        required: true, 
        maxLength: 100 // Keep it punchy
    },

    // ✨ NEW: A quick summary for previews
    shortDescription: { 
        type: String, 
        required: true, 
        maxLength: 300 
    },

    // 2. Main Content
    // This stores the HTML from your Rich Text Editor
    blogContent: { 
        type: String, 
        required: true 
    }, 
    
    // 3. Visuals
    // Stores the Cloudinary URL (like user avatar)
    image: { 
        type: String, 
        default: "" // Can be empty initially if upload fails, but we'll enforce it in controller
    },
    
    // 4. Tech Details
    techStack: [{ type: String }], // Array of strings like ["React", "Node"]
    
    githubLink: { type: String },
    liveDemoLink: { type: String, required: true },
    videoLink: { type: String }, // Optional YouTube demo
    
    // 5. Relationships & Social
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "User" // Links back to the Builder who posted it
    },
    
    likes: [{ type: String }], // Simple array of User IDs or IPs
    
    // 6. Admin/System Flags
    seasonRank: { type: Number, default: 0 }, // For your "Hall of Fame"
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },

    //7. Tagging all team members
    teamMembers: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ],
  },
  { timestamps: true } // Auto-adds createdAt and updatedAt
);

const Project = mongoose.model("Project", projectSchema);
export default Project;