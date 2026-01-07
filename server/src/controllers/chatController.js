import ChatMessage from "../models/ChatMessage.js";

// Get last 50 messages
export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate("sender", "name avatar role") // Get sender details
      .sort({ createdAt: 1 }) // Oldest first (like WhatsApp)
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Message cannot be empty" });

    const message = await ChatMessage.create({
      text,
      sender: req.user._id
    });
    
    await message.populate("sender", "name avatar role");
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Message (Admin or Owner)
export const deleteMessage = async (req, res) => {
  try {
    const msg = await ChatMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Check Permissions
    const isAdmin = req.user.role === "admin";
    const isOwner = msg.sender.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this." });
    }

    await msg.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};