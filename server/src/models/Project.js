import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    
    // 👇 NEW: Split Description
    shortDescription: { type: String, required: true, maxLength: 300 }, 
    blogContent: { type: String, required: true }, // Stores HTML from the editor
    
    techStack: [{ type: String }],
    
    // 👇 CHANGED: Validation Rules
    githubLink: { type: String }, // Optional now
    liveDemoLink: { type: String, required: true }, // Compulsory now
    
    image: { type: String },
    videoLink: { type: String },
    
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    
    likes: [{ type: String }], // Store IP addresses or simple counts if public
    
    seasonRank: { type: Number, default: 0, enum: [0, 1, 2, 3] },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;