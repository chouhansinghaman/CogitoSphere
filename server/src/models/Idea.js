// models/Idea.js
import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        }, // e.g., "AI-based Diet Planner"
        description: {
            type: String,
            required: true
        }, // The "What" and "Why"
        techStack: [{
            type: String
        }], // e.g., ["React", "Node.js", "MongoDB"]
        category: {
            type: String,
            required: true
        }, // e.g., "Web App", "Game", "Fintech"
        postedBy: {
            type: mongoose.Schema.Types.ObjectId, ref: "User",
            required: true
        },
        lookingFor: [{
            type: String
        }], // e.g., ["Designer", "Frontend Developer"]
        status: {
            type: String,
            enum: ["Open", "In-Progress", "Completed"],
            default: "Open"
        },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // People who joined
    },
    { timestamps: true }
);

const Idea = mongoose.model("Idea", ideaSchema);
export default Idea;