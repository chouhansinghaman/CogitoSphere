import Idea from "../models/Idea.js";
import Notification from "../models/Notification.js";

// 1. CREATE IDEA (Fix: Populate 'members' before sending response)
export const createIdea = async (req, res) => {
  try {
    const { title, description, tags, teamInviteLink } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and Description are required." });
    }

    let processedTags = [];
    if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
        processedTags = tags;
    }

    const newIdea = new Idea({
      title,
      description,
      tags: processedTags,
      teamInviteLink,
      postedBy: req.user._id,
      members: [req.user._id] // Owner is automatically added
    });

    const savedIdea = await newIdea.save();
    
    // CRITICAL FIX: Populate both 'postedBy' AND 'members'
    await savedIdea.populate('postedBy', 'name avatar');
    await savedIdea.populate('members', 'name avatar'); 
    
    res.status(201).json(savedIdea);
  } catch (error) {
    console.error("Error creating idea:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. GET IDEAS (Fix: Ensure 'members' are populated)
export const getIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate("postedBy", "name avatar")
      .populate("members", "name avatar") // <--- THIS LINE IS CRITICAL
      .populate("comments.sender", "name avatar")
      .sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- Join a Project Team ---
export const joinIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: "Project not found" });

    // 1. Check if User is the Owner
    if (idea.postedBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot join your own project." });
    }

    // 2. Check if already a member
    if (idea.members.includes(req.user._id)) {
        return res.status(400).json({ message: "You are already in this team." });
    }

    // 3. ✅ NEW: Check Member Limit
    if (idea.members.length >= idea.maxMembers) {
        return res.status(400).json({ message: "This team is full." });
    }

    // Add Member
    idea.members.push(req.user._id);
    await idea.save();

    res.status(200).json({ message: "Successfully joined the team!", idea });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add this new function
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: "Idea not found" });

    const newComment = {
      text,
      sender: req.user._id
    };

    idea.comments.push(newComment);
    await idea.save();

    // Re-fetch to populate the sender details immediately for UI
    await idea.populate('comments.sender', 'name avatar');

    res.status(201).json(idea.comments); // Return just the updated comments
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 1. LEAVE TEAM
export const leaveTeam = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    // Remove user from members array
    idea.members = idea.members.filter(member => member.toString() !== req.user._id.toString());
    await idea.save();
    
    res.json({ message: "Left the team" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. DELETE IDEA (Admin or Owner)
export const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    // Check permissions
    if (idea.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await idea.deleteOne();
    res.json({ message: "Idea deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. UPDATE IDEA (Owner Only)
export const updateIdea = async (req, res) => {
  try {
    const { title, description, tags, teamInviteLink } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: "Idea not found" });
    if (idea.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Process tags if they are a string
    let processedTags = idea.tags;
    if (tags && typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim());
    }

    idea.title = title || idea.title;
    idea.description = description || idea.description;
    idea.tags = processedTags;
    idea.teamInviteLink = teamInviteLink || ""; 

    if (req.body.maxMembers) idea.maxMembers = req.body.maxMembers;

    const updatedIdea = await idea.save();
    await updatedIdea.populate('postedBy', 'name avatar');
    await updatedIdea.populate('members', 'name avatar'); // Re-populate members for UI
    
    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};