import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
  FiBell, FiPlus, FiTrash2, FiX, FiUserPlus, 
  FiCheck, FiMaximize2, FiBold 
} from 'react-icons/fi';

// --- HELPER: Parse Bold Text (Markdown style **text**) ---
const renderRichText = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g); // Split by **...**
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black text-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// --- SUB-COMPONENT: Full View Modal ---
const FullNotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <FiX size={24} />
        </button>
        
        <div className="mb-6">
           <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
             {notification.type === 'project_join' ? 'Team Alert' : 'Announcement'}
           </span>
           <h2 className="text-3xl font-black mt-3 leading-tight">{notification.title}</h2>
           <p className="text-gray-400 font-bold text-xs uppercase mt-2">
             {new Date(notification.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
          {renderRichText(notification.message)}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Notification Card ---
const NotificationCard = ({ notification, isAdmin, onDelete, onMarkRead, onViewFull }) => {
  const isProjectAlert = notification.type === 'project_join';
  const isLongMessage = notification.message.length > 150;
  
  return (
    <div className={`bg-white border rounded-2xl p-6 flex items-start gap-4 relative group transition-all hover:shadow-md ${!notification.isRead && isProjectAlert ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      
      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isProjectAlert ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        {isProjectAlert ? <FiUserPlus size={24} /> : <FiBell size={24} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{notification.title}</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 whitespace-nowrap mt-1">
            {new Date(notification.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Message Preview */}
        <p className="text-gray-600 mt-2 text-sm leading-relaxed line-clamp-3">
          {renderRichText(notification.message)}
        </p>

        <div className="flex items-center gap-4 mt-3">
            {/* Read More Button */}
            {(isLongMessage || notification.message.includes("**")) && (
              <button onClick={() => onViewFull(notification)} className="text-xs font-bold text-black border-b-2 border-black/10 hover:border-black transition-colors pb-0.5 flex items-center gap-1">
                Read Full <FiMaximize2 size={10} />
              </button>
            )}

            {/* "Mark as Read" (Only for Project Alerts) */}
            {isProjectAlert && !notification.isRead && (
              <button 
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification._id); }}
                className="flex items-center gap-1 text-xs font-bold text-green-600 hover:bg-green-50 px-2 py-1 rounded-md transition-colors"
              >
                <FiCheck /> Mark Read
              </button>
            )}
        </div>
      </div>

      {/* Admin Delete */}
      {isAdmin && notification.type === 'system' && (
        <button 
            onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }} 
            className="absolute bottom-4 right-4 p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        >
            <FiTrash2 size={16} />
        </button>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Admin Create Modal ---
const NotificationFormModal = ({ show, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insertBold = () => {
    const textarea = document.getElementById("notif-message");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    setMessage(`${before}**${selected || "bold text"}**${after}`);
  };

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">System Announcement</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none font-bold" placeholder="e.g. Season 0 Live!" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Message</label>
                <button type="button" onClick={insertBold} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1 font-bold" title="Make Bold">
                    <FiBold /> Bold
                </button>
            </div>
            <textarea 
                id="notif-message"
                rows="6" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none resize-none text-sm" 
                placeholder="Use **text** for bold..." 
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg">
            {isSubmitting ? 'Posting...' : 'Broadcast Now'}
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null); // For "View Full" modal

  const fetchNotifications = async () => {
    setLoading(true);
    try {
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
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Announcement Sent!");
      setShowCreateModal(false);
      fetchNotifications();
    } catch (error) { toast.error(error.message); }
  };

  const handleMarkRead = async (id) => {
    try {
        await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this?")) return;
    try {
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
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold text-xs hover:-translate-y-1 transition-all shadow-xl">
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
              onViewFull={setSelectedNotif} // Trigger modal
            />
          ))
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="font-black text-gray-300 tracking-widest uppercase text-xs">All caught up. No new alerts.</p>
          </div>
        )}
      </main>

      {/* MODALS */}
      <NotificationFormModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleSave} />
      <FullNotificationModal notification={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
};

export default Notifications;
