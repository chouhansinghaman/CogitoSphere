// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg",
    },
    // ✅ ADDED THESE so your ProfileSection works
    github: {
      type: String,
      default: ""
    },
    linkedin: {
      type: String,
      default: ""
    },
    studyStreak: {
      type: Number,
      default: 0,
    },
    lastCheckIn: {
      type: Date,
    },
    builderProfile: {
      skills: [{ type: String }],
      interests: [{ type: String }],
      lookingForTeam: {
        type: Boolean,
        default: false
      },
      portfolioLink: { type: String },
      preferredRole: {
        type: String,
        // Ensure these match your frontend dropdown exactly
        enum: ["Frontend Developer", "Backend Developer", "Fullstack Developer", "UI/UX Designer", "Product Manager", "Other"],
        default: "Other"
      }
    },
    role: {
      type: String,
      default: "student",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Password hashing before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;