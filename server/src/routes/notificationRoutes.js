import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// --- Student Routes (Private) ---
// Get my inbox (System + Project Alerts)
router.route('/').get(protect, getUserNotifications);

// Get the number of unread alerts (For the Bell Icon)
router.get('/unread-count', protect, getUnreadCount);

// Mark a specific notification as read
router.put('/:id/read', protect, markAsRead);


// --- Admin Routes (Protected + AdminOnly) ---
// Create a broadcast message
router.route('/').post(protect, adminOnly, createNotification);

// Edit or Delete an existing notification
router.route('/:id')
    .put(protect, adminOnly, updateNotification)
    .delete(protect, adminOnly, deleteNotification);

export default router;