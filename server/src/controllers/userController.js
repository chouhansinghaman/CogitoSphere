import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import generateToken from "../utils/generateToken.js"; // Ensure you have this import if you regen token

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

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    // 1. Find the user
    const user = await User.findById(req.user._id);

    if (user) {
      // 2. Update basic fields (Only if provided in body)
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // 3. Handle Bio (Safe check)
      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }

      // 4. Handle Skills (The likely cause of the crash)
      // Check if skills exist and handle both String ("React, Node") and Array (["React", "Node"])
      if (req.body.skills) {
        if (typeof req.body.skills === 'string') {
             // Split string into array, trim spaces, remove empty strings
             user.skills = req.body.skills.split(',').map(skill => skill.trim()).filter(s => s !== "");
        } else if (Array.isArray(req.body.skills)) {
             user.skills = req.body.skills;
        }
      }

      // 5. Handle Social Links (Optional)
      if (req.body.github !== undefined) user.github = req.body.github;
      if (req.body.linkedin !== undefined) user.linkedin = req.body.linkedin;

      // 6. Handle Password (Only if user typed a new one)
      if (req.body.password) {
        user.password = req.body.password;
      }

      // 7. Save
      const updatedUser = await user.save();

      // 8. Respond with new data
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        skills: updatedUser.skills,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });

    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("❌ Update Profile Error:", error.message); // This will show in Render logs
    res.status(500).json({ message: 'Server Error during update', error: error.message });
  }
};

// ✅ FIX 2: New Function for Password Update
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Get user with password (if your model selects: false by default)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // 3. Update to new password (Pre-save hook in model should handle hashing)
    // If you don't have a pre-save hook, manually hash here:
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(newPassword, salt);
    
    user.password = newPassword; // Assuming User model has pre-save hashing
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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