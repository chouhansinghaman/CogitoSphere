import express from 'express';
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAllNotifications);

// Admin-only routes (now using 'adminOnly')
router.route('/').post(protect, adminOnly, createNotification);
router.route('/:id').put(protect, adminOnly, updateNotification).delete(protect, adminOnly, deleteNotification);

export default router;