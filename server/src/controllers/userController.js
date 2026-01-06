import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';

// --- NEW: Cloudinary Configuration ---
// Make sure your .env file is loaded in your main server file (e.g., server.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- NEW: Date Helper Functions ---
const isToday = (someDate) => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return date.setHours(0,0,0,0) === today.setHours(0,0,0,0);
};

const isYesterday = (someDate) => {
    if (!someDate) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(someDate);
    return date.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0);
};

// --- UPDATED: Get User Profile ---
export const getUserProfile = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  // Now returns builderProfile and other new fields
  res.json({
    _id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    studyStreak: req.user.studyStreak,
    lastCheckIn: req.user.lastCheckIn,
    builderProfile: req.user.builderProfile, //
  });
};

// --- NEW: Unified Update Function ---
// This handles Name, Avatar, and Build Space profile updates
export const updateUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  const { name, avatar, builderProfile } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Basic Info
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Update Build Space Profile
    if (builderProfile) {
      user.builderProfile = {
        ...user.builderProfile, // Keep existing fields
        ...builderProfile       // Overwrite with new ones
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        builderProfile: updatedUser.builderProfile,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

// --- EXISTING FUNCTIONS ---
export const deleteUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

export const makeUserAdmin = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.role = 'admin';
      const updatedUser = await user.save();
      res.status(200).json({
        message: "User successfully upgraded to admin.",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during admin upgrade", error: error.message });
  }
};

// --- NEW: Update User Avatar ---
export const updateUserAvatar = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file." });
    }
    try {
      // Convert buffer to a format Cloudinary can use
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "CogitoSphere_avatars", // A folder to keep images organized
      });
      // Update user in DB with the secure URL from Cloudinary
      const user = await User.findById(req.user._id);
      user.avatar = result.secure_url;
      await user.save();
      res.status(200).json({
          message: "Avatar updated successfully",
          avatar: user.avatar
      });
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      res.status(500).json({ message: "Server error while updating avatar.", error: err.message });
    }
};

// --- NEW: Handle Study Streak Check-in ---
export const handleCheckIn = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (isToday(user.lastCheckIn)) {
            return res.status(400).json({ message: "You have already checked in today." });
        }
        if (isYesterday(user.lastCheckIn)) {
            // If last check-in was yesterday, increment streak
            user.studyStreak += 1;
        } else {
            // Otherwise, reset streak to 1
            user.studyStreak = 1;
        }
        user.lastCheckIn = new Date();
        await user.save();
        res.json({
            message: "Check-in successful!",
            studyStreak: user.studyStreak,
            lastCheckIn: user.lastCheckIn,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during check-in.", error: error.message });
    }
};

// @desc    Get all users (for Admin Dashboard)
// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Don't send passwords
      .sort({ createdAt: -1 }); // Newest users first
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};