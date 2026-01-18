import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, // This acts as the "Blog/Story"
    techStack: [{ type: String }],
    githubLink: { type: String, required: true },
    liveDemoLink: { type: String },
    
    // 👇 NEW FIELDS
    image: { 
      type: String, 
      default: "https://via.placeholder.com/800x400?text=Project+Showcase" // Default placeholder
    },
    videoLink: { type: String }, // YouTube link for the tutorial
    
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "User" 
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;