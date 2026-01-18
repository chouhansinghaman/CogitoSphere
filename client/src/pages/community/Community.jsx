import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SEASON_CONFIG } from "../../lib/SeasonConfig.js";
import {
    FiSend, FiTrash2, FiMessageSquare, FiPlus, FiX,
    FiArrowRight, FiEdit2, FiLogOut, FiUsers, FiTag,
    FiCpu
} from "react-icons/fi";
import { IoRocketOutline, IoBulbOutline, IoTimeOutline, IoExpandOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENT: Idea Details Modal (Original Centered Design) ---
const IdeaDetailsModal = ({ idea, isOpen, onClose, onJoin, onLeave, userId, onAddComment }) => {
    const [commentText, setCommentText] = useState("");
    const [localComments, setLocalComments] = useState(idea.comments || []);
    const chatRef = useRef(null);

    if (!isOpen || !idea) return null;

    const isMember = idea.members?.some(m => m._id === userId);
    const isOwner = idea.postedBy?._id === userId;

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        const updatedComments = await onAddComment(idea._id, commentText);
        if (updatedComments) {
            setLocalComments(updatedComments);
            setCommentText("");
            setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    return (
        // CENTERED + BLURRED BACKGROUND
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                // ORIGINAL SIZE: max-w-3xl, max-h-[90vh], rounded-[2rem]
                className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover:rotate-90 transition-all z-10"><FiX size={24} /></button>

                {/* Header */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-3">{idea.title}</h2>
                    <div className="flex items-center gap-3">
                        <img src={idea.postedBy?.avatar || `https://ui-avatars.com/api/?name=${idea.postedBy?.name}`} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posted by</span>
                            <Link to={`/u/${idea.postedBy?._id}`} className="text-sm font-bold text-gray-900 hover:underline">{idea.postedBy?.name}</Link>
                        </div>
                    </div>
                </div>

                {/* Body (Split Layout: Details Left, Chat Right) */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row">
                    {/* LEFT: Description & Stats */}
                    <div className="p-8 md:w-3/5">
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Project Description</h3>
                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{idea.description}</p>
                        </div>

                        {/* Team Section */}
                        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUsers /> Team Members ({idea.members?.length})</h3>
                            <div className="flex flex-wrap gap-3">
                                {idea.members?.map((member) => (
                                    <Link to={`/u/${member._id}`} key={member._id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
                                        <img src={member.avatar || "https://via.placeholder.com/30"} className="w-6 h-6 rounded-full" alt="" />
                                        <span className="text-sm font-bold text-gray-700">{member.name}</span>
                                        {member._id === idea.postedBy?._id && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">OWNER</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiTag /> Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {idea.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded-lg border border-indigo-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Discussion / Chat */}
                    <div className="md:w-2/5 bg-gray-50 border-l border-gray-100 flex flex-col h-full min-h-[400px]">
                        <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><FiMessageSquare /> Discussion</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {localComments.length === 0 && <p className="text-center text-gray-400 text-xs italic mt-10">No comments yet. Start the conversation!</p>}
                            {localComments.map((c, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-gray-900">{c.sender?.name}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">{c.text}</p>
                                </div>
                            ))}
                            <div ref={chatRef}></div>
                        </div>

                        <form onSubmit={handleSendComment} className="p-3 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input className="flex-1 bg-gray-100 border-transparent rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-black outline-none transition-colors" placeholder="Ask a question..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                                <button type="submit" className="bg-black text-white p-2 rounded-lg hover:opacity-80"><FiSend size={14} /></button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-3">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                        {isMember ? "You are in this team" : "Looking for members"}
                    </div>
                    <div className="flex gap-3">
                        {isOwner ? (
                            <button disabled className="px-6 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed text-xs uppercase tracking-wide">Owner</button>
                        ) : isMember ? (
                            <button onClick={() => onLeave(idea._id)} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl flex items-center gap-2 transition-colors text-xs uppercase tracking-wide"><FiLogOut /> Leave</button>
                        ) : (
                            <button onClick={() => onJoin(idea)} className="px-8 py-3 bg-black text-white hover:bg-zinc-800 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all hover:scale-105 text-xs uppercase tracking-wide">
                                {idea.teamInviteLink ? "Open Invite" : "Join Team"} <FiArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- SUB-COMPONENT: Project Card ---
const ProjectCard = ({ idea, onViewDetails, onEdit, onDelete, user }) => {
    const isOwner = idea.postedBy?._id === user._id;
    const isAdmin = user.role === 'admin';
    const isMember = idea.members?.some(m => m._id === user._id);
    const commentCount = idea.comments?.length || 0;
    const maxMembers = idea.maxMembers || 5;
    const currentMembers = idea.members?.length || 0;
    const isFull = currentMembers >= maxMembers;

    return (
        <div className="group relative w-full h-full flex flex-col">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-[2rem] blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-white border border-gray-100 rounded-[2rem] p-6 flex-1 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300">

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {idea.members?.slice(0, 3).map((m, i) => (
                                <img key={i} src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m._id}`} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" />
                            ))}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isFull ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {currentMembers}/{maxMembers}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {isOwner && <button onClick={(e) => { e.stopPropagation(); onEdit(idea); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={14} /></button>}
                        {(isOwner || isAdmin) && <button onClick={(e) => { e.stopPropagation(); onDelete(idea._id); }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={14} /></button>}
                    </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{idea.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">by <span className="text-gray-600">{idea.postedBy?.name}</span></p>
                    
                    {/* DESCRIPTION WITH READ MORE BUTTON */}
                    <div className="relative">
                        <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-1">
                            {idea.description}
                        </p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onViewDetails(idea); }}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 hover:underline"
                        >
                            Read Full Details <IoExpandOutline />
                        </button>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {idea.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase text-gray-600 tracking-wide">{tag}</span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => onViewDetails(idea)} className="px-4 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors flex items-center gap-1 font-bold text-xs">
                            <FiMessageSquare /> {commentCount}
                        </button>

                        <button
                            onClick={() => !isFull && onViewDetails(idea)}
                            disabled={isFull && !isMember && !isOwner}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${isMember
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : isFull
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-black text-white hover:scale-[1.02] hover:shadow-lg"
                                }`}
                        >
                            {isMember ? "Joined ✓" : isFull ? "Team Full" : "View Details"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Create/Edit Modal ---
const IdeaModal = ({ show, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        title: "", description: "", tags: "", teamInviteLink: "", maxMembers: 5
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                tags: initialData.tags.join(", "),
                teamInviteLink: initialData.teamInviteLink || "",
                maxMembers: initialData.maxMembers || 5
            });
        } else {
            setFormData({ title: "", description: "", tags: "", teamInviteLink: "", maxMembers: 5 });
        }
    }, [initialData, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black"><FiX size={24} /></button>
                <h2 className="text-2xl font-black mb-1">{initialData ? "Edit Project" : "Post Project"}</h2>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none font-bold" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea required rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tech Stack (Comma separated) <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Link (Optional)</label>
                            <input type="url" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" placeholder="https://..." value={formData.teamInviteLink} onChange={e => setFormData({ ...formData, teamInviteLink: e.target.value })} />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Team Size <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm font-bold text-center"
                                value={formData.maxMembers}
                                onChange={e => setFormData({ ...formData, maxMembers: e.target.value })}
                            />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform mt-4 shadow-lg">
                        {loading ? "Saving..." : (initialData ? "Update Idea" : "Launch Idea")}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Community = () => {
    const { user, token } = useAuth();
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const [activeTab, setActiveTab] = useState("ideas");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    const [ideas, setIdeas] = useState([]);
    const [loadingIdeas, setLoadingIdeas] = useState(false);

    // Modals State
    const [showIdeaModal, setShowIdeaModal] = useState(false);
    const [editingIdea, setEditingIdea] = useState(null);
    const [selectedIdea, setSelectedIdea] = useState(null);

    // --- 1. CHAT LOGIC ---
    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setMessages(await res.json());
        } catch (error) { console.error(error); }
    };
    useEffect(() => {
        if (activeTab === 'chat') {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: newMessage })
            });
            setMessages([...messages, await res.json()]);
            setNewMessage("");
        } catch (error) { toast.error("Failed"); }
    };

    // --- 2. IDEA LOGIC ---
    const fetchIdeas = async () => {
        setLoadingIdeas(true);
        try {
            const res = await fetch(`${API_URL}/ideas`, { headers: { Authorization: `Bearer ${token}` } });
            setIdeas(await res.json());
        } catch (error) { toast.error("Failed to load ideas"); }
        finally { setLoadingIdeas(false); }
    };

    useEffect(() => { if (activeTab === 'ideas') fetchIdeas(); }, [activeTab]);

    const handleSaveIdea = async (formData) => {
        try {
            const isEdit = !!editingIdea;
            const url = isEdit ? `${API_URL}/ideas/${editingIdea._id}` : `${API_URL}/ideas`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Operation failed");

            const savedIdea = await res.json();

            if (isEdit) {
                setIdeas(ideas.map(i => i._id === savedIdea._id ? savedIdea : i));
                toast.success("Project Updated!");
            } else {
                setIdeas([savedIdea, ...ideas]);
                toast.success("Project Launched!");
            }
            setShowIdeaModal(false);
            setEditingIdea(null);
        } catch (error) { toast.error(error.message); }
    };

    const handleDeleteIdea = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        try {
            const res = await fetch(`${API_URL}/ideas/${id}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setIdeas(ideas.filter(i => i._id !== id));
                toast.success("Deleted");
            } else { toast.error("Unauthorized"); }
        } catch (e) { toast.error("Error deleting"); }
    };

    const handleJoinTeam = async (idea) => {
        const isProfileActive = user?.builderProfile?.lookingForTeam;

        if (!isProfileActive) {
            if (window.confirm("⚠️ Profile Inactive!\n\nYou must activate your 'Builder Profile' and add skills before joining a team.\n\nGo to Settings now?")) {
                window.location.href = "/settings";
            }
            return;
        }

        if (idea.teamInviteLink) {
            window.open(idea.teamInviteLink, "_blank");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/ideas/${idea._id}/join`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to join team");
                return;
            }

            toast.success("Joined! 🚀");
            fetchIdeas();
            setSelectedIdea(null);
        } catch (e) {
            toast.error("Network error. Try again.");
        }
    };

    const handleLeaveTeam = async (id) => {
        if (!window.confirm("Leave this team?")) return;
        try {
            const res = await fetch(`${API_URL}/ideas/${id}/leave`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Left team");
                fetchIdeas();
                setSelectedIdea(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleAddComment = async (ideaId, text) => {
        try {
            const res = await fetch(`${API_URL}/ideas/${ideaId}/comment`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text })
            });
            if (res.ok) return await res.json();
        } catch (e) { toast.error("Failed"); }
    };

    return (
        <div className="min-h-screen text-gray-900 font-sans p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-1">Season 0 Hub</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Genesis • Community</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    <button onClick={() => setActiveTab('ideas')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'ideas' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Portal & Projects</button>
                    <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Global Chat</button>
                </div>
            </div>

            {/* TAB: IDEAS / PROJECTS */}
            {activeTab === 'ideas' && (
                <div className="animate-in fade-in duration-500">
                    
                    {/* --- HERO PORTAL --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                        {/* LEFT: Submission Portal */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><IoRocketOutline className="text-9xl text-gray-900" /></div>
                            
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider mb-6 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Submission Portal Live
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-tight">Build. Submit. <br /><span className="text-indigo-600">Dominate.</span></h2>
                            <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed mb-8">
                                The submission window for Season 0 is officially open. Submit your project to enter the Hall of Fame.
                            </p>
                            
                            <div className="flex flex-wrap gap-3">
                                <Link to="/add-project" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-gray-200 flex items-center gap-2">
                                    Launch Project 🚀
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT: Post Idea (ENDED) */}
                        <div className="lg:col-span-1 bg-gray-100 rounded-[2.5rem] p-8 border border-gray-200 shadow-none flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-6 right-6"><span className="bg-red-100 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">Ended</span></div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 text-2xl border border-gray-200"><IoBulbOutline /></div>
                            <h3 className="text-2xl font-black text-gray-400 mb-2">Post an Idea</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">The idea discussion phase has concluded for Season 0. You can no longer post new ideas.</p>
                            <button disabled className="w-full py-3 bg-white text-gray-400 font-bold rounded-xl border border-gray-200 cursor-not-allowed text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                <IoTimeOutline /> Closed: Jan 11, 2026
                            </button>
                        </div>
                    </div>

                    {/* --- PROJECT GRID --- */}
                    <div className="mb-6 flex items-center justify-between">
                         <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FiCpu /> Community Projects</h3>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{ideas.length} Active</span>
                    </div>

                    {loadingIdeas ? (
                        <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Projects...</div>
                    ) : ideas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ideas.map(idea => (
                                <ProjectCard
                                    key={idea._id}
                                    idea={idea}
                                    user={user}
                                    onViewDetails={setSelectedIdea}
                                    onDelete={handleDeleteIdea}
                                    onEdit={(idea) => { setEditingIdea(idea); setShowIdeaModal(true); }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200"><p className="text-gray-400 font-bold mb-2">No projects yet.</p></div>
                    )}

                    <IdeaModal show={showIdeaModal} initialData={editingIdea} onClose={() => setShowIdeaModal(false)} onSave={handleSaveIdea} />

                    <AnimatePresence>
                        {selectedIdea && (
                            <IdeaDetailsModal
                                idea={selectedIdea}
                                isOpen={!!selectedIdea}
                                onClose={() => setSelectedIdea(null)}
                                onJoin={handleJoinTeam}
                                onLeave={handleLeaveTeam}
                                userId={user._id}
                                onAddComment={handleAddComment}
                            />
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* TAB: CHAT */}
            {activeTab === 'chat' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                    <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                        <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10 shadow-sm shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><FiMessageSquare /></div>
                                <div><h3 className="font-bold text-gray-900 leading-none">Season 0 Lobby</h3><span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span></div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex gap-3 ${msg.sender?._id === user._id ? 'flex-row-reverse' : ''}`}>
                                    <Link to={`/u/${msg.sender?._id}`}>
                                        <img src={msg.sender?.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full border border-gray-200 self-end mb-1 hover:scale-110 transition-transform cursor-pointer" />
                                    </Link>
                                    <div className={`relative max-w-[70%] group`}>
                                        <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user._id ? 'justify-end' : ''}`}>
                                            <Link to={`/u/${msg.sender?._id}`} className="text-[10px] font-bold text-gray-400 uppercase hover:text-black hover:underline cursor-pointer">
                                                {msg.sender?.name}
                                            </Link>
                                        </div>
                                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.sender?._id === user._id ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center shrink-0">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 transition-all outline-none text-sm font-medium" />
                            <button type="submit" disabled={!newMessage.trim()} className="bg-black text-white p-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 shadow-lg shadow-gray-300/50"><FiSend size={18} /></button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;