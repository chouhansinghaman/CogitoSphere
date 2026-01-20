import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    FiSend, FiTrash2, FiMessageSquare, FiX,
    FiArrowRight, FiEdit2, FiLogOut, FiUsers, FiTag,
    FiCpu, FiLayers, FiLock
} from "react-icons/fi";
import { IoRocketOutline, IoBulbOutline, IoTimeOutline, IoExpandOutline, IoImageOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. NEW CARD: For Submitted Projects (Links to Blog Page) ---
const SubmittedProjectCard = ({ project, user, onDelete }) => {
    const isOwner = project.user?._id === user._id;
    const isAdmin = user.role === 'admin';

    return (
        <div className="group relative w-full flex flex-col h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white border border-gray-200 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300">
                
                {/* Cover Image - Links to Project Details */}
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden group">
                    <Link to={`/project/${project._id}`}>
                        {project.image ? (
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <IoImageOutline className="text-4xl" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </Link>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm">
                        Season 0
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            <Link to={`/project/${project._id}`}>{project.title}</Link>
                        </h3>
                        {(isOwner || isAdmin) && (
                            <button onClick={(e) => { e.preventDefault(); onDelete(project._id, 'project'); }} className="text-gray-300 hover:text-red-500 transition-colors">
                                <FiTrash2 />
                            </button>
                        )}
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        by <span className="text-gray-700">{project.user?.name || "Builder"}</span>
                    </p>

                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-6">
                        {project.shortDescription}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center gap-2">
                        <Link 
                            to={`/project/${project._id}`}
                            className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-md group-hover:shadow-lg"
                        >
                            Read Story <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. ORIGINAL IDEA CARD: Restored Functionality (Opens Modal) ---
const IdeaCard = ({ idea, onViewDetails, onEdit, onDelete, user }) => {
    const isOwner = idea.postedBy?._id === user._id;
    const isAdmin = user.role === 'admin';
    const commentCount = idea.comments?.length || 0;
    const maxMembers = idea.maxMembers || 5;
    const currentMembers = idea.members?.length || 0;

    return (
        <div className="group relative w-full h-full flex flex-col opacity-90 hover:opacity-100 transition-opacity">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-[2rem] blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            
            {/* CLICKING THE CARD BODY OPENS THE MODAL (Original Feature) */}
            <div 
                onClick={() => onViewDetails(idea)} 
                className="relative bg-white border border-gray-200 rounded-[2rem] p-6 flex-1 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {idea.members?.slice(0, 3).map((m, i) => (
                                <img key={i} src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m._id}`} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">
                            {currentMembers}/{maxMembers}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {isOwner && <button onClick={(e) => { e.stopPropagation(); onEdit(idea); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={14} /></button>}
                        {(isOwner || isAdmin) && <button onClick={(e) => { e.stopPropagation(); onDelete(idea._id, 'idea'); }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={14} /></button>}
                    </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{idea.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">by <span className="text-gray-600">{idea.postedBy?.name}</span></p>
                    
                    <div className="relative">
                        <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-1">
                            {idea.description}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1 mt-1">
                            View Discussion <IoExpandOutline />
                        </span>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {idea.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase text-gray-600 tracking-wide">{tag}</span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 flex items-center gap-1 font-bold text-xs">
                            <FiMessageSquare /> {commentCount}
                        </div>

                        {/* 🚫 DISABLED JOIN BUTTON (Original Style but Grayed Out) */}
                        <button
                            disabled
                            className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-none bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        >
                            <FiLock /> Formation Closed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. MODAL (For Old Ideas - Unchanged) ---
const IdeaDetailsModal = ({ idea, isOpen, onClose, onJoin, onLeave, userId, onAddComment }) => {
    const [commentText, setCommentText] = useState("");
    const [localComments, setLocalComments] = useState(idea.comments || []);
    const chatRef = useRef(null);

    if (!isOpen || !idea) return null;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 hover:rotate-90 transition-all z-10"><FiX size={24} /></button>
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-3">{idea.title}</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posted by {idea.postedBy?.name}</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-200">Archived</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row">
                    <div className="p-8 md:w-3/5">
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{idea.description}</p>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3 text-gray-500 text-sm">
                            <FiLock /> Team formation for this idea has ended.
                        </div>
                    </div>
                    <div className="md:w-2/5 bg-gray-50 border-l border-gray-100 flex flex-col h-full min-h-[400px]">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {localComments.map((c, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs">
                                    <span className="font-bold text-gray-900">{c.sender?.name}</span>
                                    <p className="text-gray-600 leading-relaxed">{c.text}</p>
                                </div>
                            ))}
                            <div ref={chatRef}></div>
                        </div>
                        <form onSubmit={handleSendComment} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                            <input className="flex-1 bg-gray-100 border-transparent rounded-lg px-3 py-2 text-xs focus:bg-white outline-none" placeholder="Ask a question..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                            <button type="submit" className="bg-black text-white p-2 rounded-lg"><FiSend size={14} /></button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Community = () => {
    const { user, token } = useAuth();
    // ✅ Use correct Env Var to prevent 404/500 errors
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

    const [activeTab, setActiveTab] = useState("ideas");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    // Data State
    const [ideas, setIdeas] = useState([]);
    const [projects, setProjects] = useState([]); 
    const [loading, setLoading] = useState(false);

    // Modals
    const [selectedIdea, setSelectedIdea] = useState(null);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Old Ideas
            const ideasRes = await fetch(`${API_BASE_URL}/ideas`, { headers: { Authorization: `Bearer ${token}` } });
            if (ideasRes.ok) setIdeas(await ideasRes.json());

            // 2. Fetch New Projects (Blogs)
            const projectsRes = await fetch(`${API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
            if (projectsRes.ok) setProjects(await projectsRes.json());

        } catch (error) { 
            // Silent fail or toast
            console.error("Failed to load community data"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (activeTab === 'ideas') fetchData(); }, [activeTab]);

    // Chat Logic
    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } });
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
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await fetch(`${API_BASE_URL}/chat`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: newMessage })
        });
        setNewMessage("");
        fetchMessages();
    };

    const handleAddComment = async (ideaId, text) => {
        const res = await fetch(`${API_BASE_URL}/ideas/${ideaId}/comment`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text })
        });
        if (res.ok) return await res.json();
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm("Are you sure?")) return;
        const endpoint = type === 'project' ? 'projects' : 'ideas';
        try {
            const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                toast.success("Deleted");
                fetchData();
            }
        } catch(e) { toast.error("Error deleting"); }
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

            {/* TAB: PORTAL & PROJECTS */}
            {activeTab === 'ideas' && (
                <div className="animate-in fade-in duration-500">
                    
                    {/* 1. HERO PORTAL (Submission Info) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><IoRocketOutline className="text-9xl text-gray-900" /></div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider mb-6 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Submission Portal Live
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-tight">Build. Submit. <br /><span className="text-indigo-600">Dominate.</span></h2>
                            <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed mb-8">
                                The submission window for Season 0 is officially open. Submit your project to enter the Hall of Fame.
                            </p>
                            <Link to="/add-project" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-gray-200 flex items-center gap-2 w-fit">
                                Launch Project 🚀
                            </Link>
                        </div>
                        <div className="lg:col-span-1 bg-gray-100 rounded-[2.5rem] p-8 border border-gray-200 shadow-none flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-6 right-6"><span className="bg-red-100 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">Ended</span></div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 text-2xl border border-gray-200"><IoBulbOutline /></div>
                            <h3 className="text-2xl font-black text-gray-400 mb-2">Post an Idea</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">The idea discussion phase has concluded. You can no longer post new ideas.</p>
                            <button disabled className="w-full py-3 bg-white text-gray-400 font-bold rounded-xl border border-gray-200 cursor-not-allowed text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                <IoTimeOutline /> Closed
                            </button>
                        </div>
                    </div>

                    {/* 2. SUBMITTED PROJECTS SECTION (New) */}
                    <div className="mb-6 flex items-center justify-between">
                         <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FiCpu /> Community Projects</h3>
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">{projects.length} Submitted</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</div>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                            {projects.map(project => (
                                <SubmittedProjectCard
                                    key={project._id}
                                    project={project}
                                    user={user}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-20">
                            <p className="text-gray-400 font-bold mb-2">No projects submitted yet.</p>
                            <p className="text-xs text-gray-300">Be the first to enter the Hall of Fame.</p>
                        </div>
                    )}

                    {/* DIVIDER */}
                    <div className="flex items-center gap-4 mb-10 opacity-50">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Archive</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    {/* 3. OLD IDEAS SECTION (Original Cards, Disabled Join) */}
                    <div className="mb-6 flex items-center justify-between opacity-60">
                         <h3 className="text-xl font-bold text-gray-500 flex items-center gap-2"><FiLayers /> Team Formation Ideas</h3>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{ideas.length} Archived</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ideas.map(idea => (
                            <IdeaCard
                                key={idea._id}
                                idea={idea}
                                user={user}
                                onDelete={handleDelete}
                                onEdit={() => toast("Editing is closed")}
                                onViewDetails={setSelectedIdea}
                            />
                        ))}
                    </div>

                    {/* Modal for Old Ideas */}
                    <AnimatePresence>
                        {selectedIdea && (
                            <IdeaDetailsModal
                                idea={selectedIdea}
                                isOpen={!!selectedIdea}
                                onClose={() => setSelectedIdea(null)}
                                userId={user._id}
                                onAddComment={handleAddComment}
                            />
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* TAB: CHAT (Lobby) */}
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
                                    <img src={msg.sender?.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full border border-gray-200 self-end mb-1" />
                                    <div className={`relative max-w-[70%]`}>
                                        <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user._id ? 'justify-end' : ''}`}><span className="text-[10px] font-bold text-gray-400 uppercase">{msg.sender?.name}</span></div>
                                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.sender?._id === user._id ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center shrink-0">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-gray-200 outline-none text-sm font-medium" />
                            <button type="submit" disabled={!newMessage.trim()} className="bg-black text-white p-4 rounded-2xl hover:scale-105 transition-transform"><FiSend size={18} /></button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;