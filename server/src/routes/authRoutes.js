// routes/authRoutes.js

import express from "express";
import {
    registerUser,
    loginUser,
    updateUserPassword,
    resetPassword,
    forgotPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // 2. Import your auth middleware

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 3. Add the new protected route for changing the password
// The 'protect' middleware will run first to verify the user's token.
router.put("/change-password", protect, updateUserPassword);

export default router;