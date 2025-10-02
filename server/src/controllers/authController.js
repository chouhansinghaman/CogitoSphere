// controllers/userController.js

import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, username, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            username,
            email,
            password,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (err) {
        // ✅ FIX: The server must send a JSON response on error, not call React hooks.
        console.error("❌ Registration error:", err.message);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ✨ NEW: Update user password
// @desc    Update user password
// @route   PUT /api/users/change-password
// @access  Private
export const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // req.user._id is attached by your authentication middleware
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the current password is correct
        if (await user.matchPassword(currentPassword)) {
            user.password = newPassword; // Mongoose middleware will re-hash this
            await user.save();
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(401).json({ message: "Incorrect current password" });
        }
    } catch (err) {
        console.error("❌ Password update error:", err.message);
        res.status(500).json({ message: "Server error while updating password." });
    }
};

// Forgot Password controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security: don’t reveal if the email exists
      return res.json({ message: "If the account exists, a reset email has been sent." });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save token + expiry
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Create clickable reset link
    const resetLink = `${process.env.VITE_FRONTEND_URL}/reset-password?email=${encodeURIComponent(
      user.email
    )}&code=${resetCode}`;

    // Email HTML
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>Or use this code manually: <b>${resetCode}</b></p>
      <p>This link/code expires in 15 minutes.</p>
    `;

    // Send email
    await sendEmail(user.email, "Reset Your Password", html);

    // Log code & preview URL for local testing (optional)
    console.log(`Password reset code for ${user.email}: ${resetCode}`);

    res.json({ message: "If the account exists, a reset email has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while sending reset email." });
  }
};

// Reset Password controller
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired code." });

    user.password = newPassword; // hashed via pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while resetting password." });
  }
};

