import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    // Who created it (Admin or System)
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    // NEW: Who is it for? (If null, it's for everyone/system wide)
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    // NEW: What kind? 'system' (admin announcement) or 'project_join'
    type: { 
      type: String, enum: ['system', 'project_join'], 
      default: 'system' 
    },
    // NEW: Link to the specific project (optional)
    relatedId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Idea", 
      default: null 
    },
    // NEW: Read status
    isRead: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;