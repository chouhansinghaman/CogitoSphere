import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  tags: [{ 
    type: String 
  }],
  teamInviteLink: { 
    type: String 
  }, 
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  comments: [
    {
      text: { type: String, required: true },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Idea", ideaSchema);