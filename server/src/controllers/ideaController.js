import Idea from "../models/Idea.js";
import Notification from "../models/Notification.js";

// --- Create a New Project Idea ---
export const createIdea = async (req, res) => {
    try {
        const { title, description, techStack, lookingFor, category } = req.body;
        
        const newIdea = new Idea({
            title,
            description,
            techStack,
            lookingFor,
            category,
            postedBy: req.user._id, // Set by authMiddleware
            members: [req.user._id] // The creator is the first member
        });

        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea);
    } catch (error) {
        res.status(500).json({ message: "Failed to create idea", error: error.message });
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