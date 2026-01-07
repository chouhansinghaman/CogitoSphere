import Idea from "../models/Idea.js";
import Notification from "../models/Notification.js";

// --- Create a New Project Idea ---
export const createIdea = async (req, res) => {
  try {
    const { title, description, tags, teamInviteLink } = req.body;

    // FIX: Only check for Title and Description. Link is now optional.
    if (!title || !description) {
      return res.status(400).json({ message: "Title and Description are required." });
    }

    // Process tags
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
      teamInviteLink, // It's okay if this is undefined/null now
      postedBy: req.user._id,
      members: [req.user._id]
    });

    const savedIdea = await newIdea.save();
    await savedIdea.populate('postedBy', 'name avatar');
    
    res.status(201).json(savedIdea);
  } catch (error) {
    console.error("Error creating idea:", error);
    res.status(500).json({ message: "Server error while creating idea." });
  }
};

// --- Get All Ideas (For the Build Hub Tab) ---
export const getIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find()
            .populate("postedBy", "username avatar")
            .sort({ createdAt: -1 });
        res.status(200).json(ideas);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ideas", error: error.message });
    }
};

// --- Join a Project Team ---
export const joinIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ message: "Idea not found" });

        if (idea.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already a member" });
        }

        // 1. Add Member
        idea.members.push(req.user._id);
        await idea.save();

        // 2. CREATE NOTIFICATION (The Missing Piece)
        // Notify the project owner that someone joined
        if (idea.postedBy.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: idea.postedBy,
                sender: req.user._id,
                type: "project_join", // You can filter by this type in frontend
                message: `${req.user.username} joined your project: ${idea.title}`,
                relatedId: idea._id,
                isRead: false
            });
        }

        res.status(200).json({ message: "Successfully joined", idea });
    } catch (error) {
        res.status(500).json({ message: "Error joining", error: error.message });
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