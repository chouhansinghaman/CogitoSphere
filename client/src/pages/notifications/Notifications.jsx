import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiPlus, FiEdit, FiTrash2, FiX, FiUserPlus, FiCheck } from 'react-icons/fi';

// --- NOTIFICATION CARD ---
const NotificationCard = ({ notification, isAdmin, onDelete, onMarkRead }) => {
  const isProjectAlert = notification.type === 'project_join';
  
  return (
    <div className={`bg-white border rounded-2xl p-6 flex items-start gap-4 relative group transition-all hover:shadow-md ${!notification.isRead && isProjectAlert ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      
      {/* Icon changes based on type */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isProjectAlert ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        {isProjectAlert ? <FiUserPlus size={24} /> : <FiBell size={24} />}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {new Date(notification.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <p className="text-gray-700 mt-1 text-sm">{notification.message}</p>
        
        {/* "Mark as Read" Button for Project Alerts */}
        {isProjectAlert && !notification.isRead && (
           <button 
             onClick={() => onMarkRead(notification._id)}
             className="mt-3 flex items-center gap-1 text-xs font-bold text-green-600 hover:underline"
           >
             <FiCheck /> Mark as Read
           </button>
        )}
      </div>

      {/* Admin Controls */}
      {isAdmin && notification.type === 'system' && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDelete(notification._id)} className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors">
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- MODAL ---
const NotificationFormModal = ({ show, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error('Required fields missing');
    setIsSubmitting(true);
    await onSave({ title, message });
    setIsSubmitting(false);
    setTitle(''); setMessage('');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">System Announcement</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none" placeholder="Announcement Title" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message</label>
            <textarea rows="4" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none resize-none" placeholder="What do you want to tell everyone?" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:scale-[1.02] transition-transform">
            {isSubmitting ? 'Posting...' : 'Broadcast to All Users'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const Notifications = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // ✅ FIX 1: Removed extra '/api'
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) { toast.error("Sync failed"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const handleSave = async (formData) => {
    try {
      // ✅ FIX 2: Removed extra '/api'
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Announcement Sent!");
      setShowModal(false);
      fetchNotifications();
    } catch (error) { toast.error(error.message); }
  };

  const handleMarkRead = async (id) => {
    try {
        // ✅ FIX 3: Removed extra '/api'
        await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this?")) return;
    try {
        // ✅ FIX 4: Removed extra '/api'
        await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Deleted");
    } catch(e) { toast.error("Failed"); }
  };

  return (
    <div className="w-full min-h-screen font-sans p-4 sm:p-0">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">Inbox</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Updates & Alerts</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold text-xs hover:-translate-y-1 transition-all shadow-xl">
            <FiPlus /> New Announcement
          </button>
        )}
      </header>

      <main className="space-y-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-20 opacity-50 font-black text-xs tracking-widest uppercase">Checking Inbox...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationCard 
              key={notif._id} 
              notification={notif} 
              isAdmin={isAdmin} 
              onDelete={handleDelete}
              onMarkRead={handleMarkRead}
            />
          ))
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="font-black text-gray-300 tracking-widest uppercase text-xs">All caught up. No new alerts.</p>
          </div>
        )}
      </main>

      <NotificationFormModal show={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </div>
  );
};

export default Notifications;