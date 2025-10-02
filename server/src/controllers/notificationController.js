import Notification from '../models/Notification.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('createdBy', 'name username') // Populate creator's info
      .sort({ createdAt: -1 }); // Show newest first
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a notification
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
      createdBy: req.user._id, // Comes from the 'protect' middleware
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
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
};