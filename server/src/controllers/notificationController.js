import Notification from '../models/Notification.js';

// @desc    Get MY notifications (Personal + System)
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
        $or: [
            { recipient: req.user._id }, // Messages specifically for me (Project Joins)
            { type: 'system' }           // Announcements for everyone
        ]
    })
      .populate('createdBy', 'name username') // Show who sent it
      .populate('relatedId', 'title')         // Show project title if it exists
      .sort({ createdAt: -1 });               // Newest first

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching notifications' });
  }
};

// @desc    Get Unread Count (For the Bell Icon red dot)
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching count' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Only the recipient can mark it as read
        if (notification.recipient && notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a notification (Admin Broadcast)
// @route   POST /api/notifications
// @access  Admin
const createNotification = async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Please provide a title and message' });
  }

  try {
    const notification = new Notification({
      title,
      message,
      createdBy: req.user._id,
      type: 'system', // Admin creates system-wide alerts by default
      recipient: null // Null means "for everyone"
    });

    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a notification
// @route   PUT /api/notifications/:id
// @access  Admin
const updateNotification = async (req, res) => {
  const { title, message } = req.body;
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      notification.title = title || notification.title;
      notification.message = message || notification.message;
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Admin
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      await notification.deleteOne();
      res.json({ message: 'Notification removed' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
};