import User from "../models/User.js";
import Idea from "../models/Idea.js";
import { v2 as cloudinary } from 'cloudinary';

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Date Helper Functions ---
const isToday = (someDate) => {
  if (!someDate) return false;
  const today = new Date();
  const date = new Date(someDate);
  return date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
};

const isYesterday = (someDate) => {
  if (!someDate) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(someDate);
  return date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0);
};

// --- UPDATED: Get User Profile ---
export const getUserProfile = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  res.json({
    _id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    // ✅ ADDED THESE so they show up in your Settings form
    github: req.user.github,
    linkedin: req.user.linkedin,
    builderProfile: req.user.builderProfile,
    studyStreak: req.user.studyStreak,
    lastCheckIn: req.user.lastCheckIn,
  });
};

// --- UPDATED: Update User Profile ---
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Basic Fields
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.email !== undefined) user.email = req.body.email;

      // 2. Social Links (Top Level)
      if (req.body.github !== undefined) user.github = req.body.github;
      if (req.body.linkedin !== undefined) user.linkedin = req.body.linkedin;

      // 3. ✅ CRITICAL FIX: Builder Profile (Deep Merge)
      if (req.body.builderProfile) {
        user.builderProfile = {
          ...user.builderProfile, // Keep existing sub-fields (like interests/portfolio)
          ...req.body.builderProfile // Overwrite with new data (skills/role)
        };
      }

      // 4. Password (Only update if provided)
      if (req.body.password && req.body.password.trim() !== "") {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          github: updatedUser.github,
          linkedin: updatedUser.linkedin,
          builderProfile: updatedUser.builderProfile,
          studyStreak: updatedUser.studyStreak
        }
      });

    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ message: 'Server Update Failed', error: error.message });
  }
};

// --- Update Password (Dedicated) ---
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Select password because it's usually hidden
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isMatch = await user.matchPassword(currentPassword); // Uses the method from your Model
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Update password (Pre-save hook in Model will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- Delete User ---
export const deleteUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// --- Admin Upgrade ---
export const makeUserAdmin = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.role = 'admin';
      const updatedUser = await user.save();
      res.status(200).json({
        message: "User successfully upgraded to admin.",
        user: updatedUser // Simplified return
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during admin upgrade", error: error.message });
  }
};

// --- Update Avatar (Cloudinary) ---
export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image file." });
  }
  try {
    // Convert buffer to Base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "CogitoSphere_avatars",
    });

    // Save URL
    const user = await User.findById(req.user._id);
    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
      user: user // Return full user to sync context
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ message: "Server error while updating avatar.", error: err.message });
  }
};

// --- Study Streak Check-in ---
export const handleCheckIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (isToday(user.lastCheckIn)) {
      return res.status(400).json({ message: "You have already checked in today." });
    }
    if (isYesterday(user.lastCheckIn)) {
      user.studyStreak += 1;
    } else {
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

// --- Get All Users (Admin) ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get public profile of a specific user by ID
// @route   GET /api/users/public/:id
// @access  Protected (Only logged in members can see others)
export const getPublicUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Fetch User Details (excluding sensitive data)
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Fetch Ideas (Created by user OR Joined by user)
    const ideas = await Idea.find({
      $or: [
        { postedBy: userId },                // Created by them
        { 'members._id': userId }            // OR they are in the members list
      ]
    })
      .populate('postedBy', 'name avatar')         // Get creator details
      .sort({ createdAt: -1 });                    // Newest first

    // 3. Return combined object
    res.json({
      ...user.toObject(), // Convert Mongoose doc to plain object
      ideas: ideas        // Attach the found ideas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/admin/:id
// @access  Admin
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};