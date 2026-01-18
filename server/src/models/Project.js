import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    githubLink: { type: String, required: true },
    liveDemoLink: { type: String },
    image: { type: String },
    videoLink: { type: String },
    
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    
    // 👇 NEW FIELD FOR LEADERBOARD
    seasonRank: { 
        type: Number, 
        default: 0, // 0 = Unranked, 1 = Gold, 2 = Silver, 3 = Bronze
        enum: [0, 1, 2, 3] 
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