import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [String],
    teamInviteLink: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    // ✅ NEW: Member Limit (Default 5)
    maxMembers: { 
        type: Number, 
        default: 5,
        max: 10 
    },
    
    comments: [
      {
        text: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Idea", ideaSchema);