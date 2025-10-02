import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

// --- NOTIFICATION CARD SUB-COMPONENT ---
const NotificationCard = ({ notification, isAdmin, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 relative group hover:shadow-md transition-shadow">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
      <FiBell size={24} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
        <p className="text-sm text-gray-500">
          {new Date(notification.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <p className="text-gray-700 mt-1">{notification.message}</p>
    </div>
    {isAdmin && (
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(notification)}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          aria-label="Edit notification"
        >
          <FiEdit size={16} />
        </button>
        <button
          onClick={() => onDelete(notification._id)}
          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
          aria-label="Delete notification"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    )}
  </div>
);

// --- NOTIFICATION FORM MODAL SUB-COMPONENT ---
const NotificationFormModal = ({ show, onClose, onSave, notificationToEdit }) => {
  const isEditing = !!notificationToEdit;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setTitle(notificationToEdit.title);
      setMessage(notificationToEdit.message);
    } else {
      setTitle('');
      setMessage('');
    }
  }, [notificationToEdit, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error('Title and message are required.');
    setIsSubmitting(true);
    await onSave({ title, message });
    setIsSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Notification' : 'Create Notification'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-2">Message</label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-70">
              {isSubmitting ? 'Saving...' : 'Save Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN NOTIFICATIONS PAGE COMPONENT ---
const Notifications = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notificationToEdit, setNotificationToEdit] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      const res = await fetch('import.meta.env.VITE_API_URL/api/notifications', {
        // 👇 ADD THIS HEADERS OBJECT
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications.');
      const data = await res.json();
      setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [API_URL, token]);

  const handleCreateClick = () => {
    setNotificationToEdit(null);
    setShowModal(true);
  };

  const handleEditClick = (notification) => {
    setNotificationToEdit(notification);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNotificationToEdit(null);
  };

  const handleSave = async (formData) => {
    const isEditing = !!notificationToEdit;
    const url = isEditing
      ? `${API_URL}/api/notifications/${notificationToEdit._id}`
      : `${API_URL}/api/notifications`;
      ? `import.meta.env.VITE_API_URL/api/notifications/${notificationToEdit._id}`
      : 'import.meta.env.VITE_API_URL/api/notifications';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} notification.`);
      toast.success(`Notification ${isEditing ? 'updated' : 'created'} successfully!`);
      handleCloseModal();
      fetchNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete notification.');
      toast.success('Notification deleted.');
      fetchNotifications();
    } catch (error) {
      toast.error(error.message);
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const res = await fetch(`import.meta.env.VITE_API_URL/api/notifications/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete notification.');
        toast.success('Notification deleted.');
        fetchNotifications(); // Refresh the list
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-sans p-4 sm:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black text-center md:text-left">
          Notifications
        </h1>
        {isAdmin && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiPlus size={18} />
            <span>Create Notification</span>
          </button>
        )}
      </header>

      {/* Notifications List */}
      <main className="flex-1 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationCard
              key={notif._id}
              notification={notif}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center p-10 bg-gray-100 rounded-2xl">
            <h3 className="text-xl font-semibold text-black">No Notifications Yet</h3>
            <p className="text-gray-600 mt-2">Check back later for important updates.</p>
          </div>
        )}
      </main>

      {/* Form Modal */}
      <NotificationFormModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        notificationToEdit={notificationToEdit}
      />
    </div>
  );
};

export default Notifications;
