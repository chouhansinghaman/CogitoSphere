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

// @desc    Update user password
// @route   PUT /api/users/change-password
// @access  Private
export const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (await user.matchPassword(currentPassword)) {
            user.password = newPassword; 
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
      return res.json({ message: "If the account exists, a reset email has been sent." });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // ✅ FIX: Fallback URL if Env Variable is missing
    // This ensures the link is never "undefined"
    const clientURL = process.env.VITE_FRONTEND_URL || "https://cogitosphere-client.onrender.com";

    const resetLink = `${clientURL}/reset-password?email=${encodeURIComponent(
      user.email
    )}&code=${resetCode}`;

    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>Or use this code manually: <b>${resetCode}</b></p>
      <p>This link/code expires in 15 minutes.</p>
    `;

    await sendEmail(user.email, "Reset Your Password", html);

    // Keep this log for debugging
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

    user.password = newPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while resetting password." });
  }
};