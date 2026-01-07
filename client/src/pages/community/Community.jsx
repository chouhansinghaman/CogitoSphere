import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { 
  FiSend, 
  FiTrash2, 
  FiMessageSquare, 
  FiPlus, 
  FiX, 
  FiArrowRight, 
  FiZap,
  FiUserPlus
} from "react-icons/fi";

// --- SUB-COMPONENT: High Voltage Project Card (With Comments) ---
const ProjectCard = ({ idea, onJoin, onAddComment, user }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(idea.comments || []);
  const [isMember, setIsMember] = useState(idea.members.some(m => m._id === user._id));

  // Handle posting a comment locally + API
  const handlePostComment = async (e) => {
    e.preventDefault();
    if(!commentText.trim()) return;
    
    const updatedComments = await onAddComment(idea._id, commentText);
    if(updatedComments) {
        setLocalComments(updatedComments);
        setCommentText("");
    }
  };

  const handleJoinClick = () => {
      onJoin(idea);
      // Optimistically update UI if they just joined via button
      if (!idea.teamInviteLink) setIsMember(true);
  };

  return (
    <div className="group relative w-full h-full flex flex-col">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Card Content */}
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
        
        {!showComments ? (
            <>
                {/* --- VIEW 1: DETAILS --- */}
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 text-yellow-500">
                           <FiZap size={20} fill="currentColor" />
                        </div>
                        <div className="flex -space-x-2">
                            {idea.members.slice(0,3).map((m, i) => (
                                <img key={i} src={m.avatar || "https://via.placeholder.com/30"} alt={m.name} className="w-6 h-6 rounded-full border-2 border-white" title={m.name} />
                            ))}
                            {idea.members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">+{idea.members.length - 3}</div>
                            )}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 transition-all">
                        {idea.title}
                    </h3>
                    
                    {/* Owner Info */}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Posted by {idea.postedBy?.name}
                    </p>

                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">
                        {idea.description}
                    </p>
                </div>

                <div className="mt-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {idea.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-bold uppercase text-gray-600">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Dynamic Join Button */}
                        {isMember ? (
                             <button disabled className="flex-1 py-3 rounded-xl bg-green-50 text-green-600 border border-green-200 font-bold text-xs uppercase tracking-widest cursor-default">
                                Joined
                             </button>
                        ) : (
                            <button 
                                onClick={handleJoinClick}
                                className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                            >
                                {idea.teamInviteLink ? "Open Link" : "Join Team"} <FiArrowRight />
                            </button>
                        )}

                        {/* Comment Toggle */}
                        <button 
                            onClick={() => setShowComments(true)} 
                            className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors flex items-center gap-2 font-bold text-xs"
                        >
                            <FiMessageSquare /> {localComments.length}
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <>
                {/* --- VIEW 2: COMMENTS/DISCUSSION --- */}
                <div className="flex-1 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">Discussion</h4>
                        <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-full"><FiX /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto min-h-[150px] space-y-3 mb-4 pr-1 scrollbar-thin">
                        {localComments.length === 0 && <div className="text-center py-4 text-xs text-gray-300 italic">No questions yet. Ask one!</div>}
                        
                        {localComments.map((c, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-xl text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-gray-900">{c.sender?.name || "User"}</span>
                                    <span className="text-[9px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed">{c.text}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handlePostComment} className="mt-auto flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none transition-colors"
                            placeholder="Ask about this project..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" className="bg-black text-white p-2.5 rounded-xl hover:opacity-80"><FiSend size={12}/></button>
                    </form>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Create Idea Modal ---
const CreateIdeaModal = ({ show, onClose, onSave }) => {
    const [formData, setFormData] = useState({ title: "", description: "", tags: "", teamInviteLink: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
        setFormData({ title: "", description: "", tags: "", teamInviteLink: "" });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black"><FiX size={24}/></button>
                <h2 className="text-2xl font-black mb-1">Post Project Idea</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Recruit your team</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none font-bold" placeholder="e.g. AI Resume Reviewer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pitch (Description) <span className="text-red-500">*</span></label>
                        <textarea required rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" placeholder="What problem are you solving? Who do you need?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tech Stack (Tags) <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" placeholder="React, Node, AI..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Link (Optional)</label>
                        <input type="url" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" placeholder="WhatsApp / Discord Link" value={formData.teamInviteLink} onChange={e => setFormData({...formData, teamInviteLink: e.target.value})} />
                        <p className="text-[10px] text-gray-400 mt-1">Leave empty if you want them to contact you via Email/Profile.</p>
                    </div>
                    
                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform mt-4">
                        {loading ? "Posting..." : "Launch Idea"}
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
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // Idea State
  const [ideas, setIdeas] = useState([]);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // --- 1. CHAT LOGIC ---
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
          const data = await res.json();
          setMessages(data);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
        fetchMessages();
        scrollToBottom();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }
  }, [activeTab]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newMessage })
      });
      const data = await res.json();
      setMessages([...messages, data]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) { toast.error("Failed to send"); }
  };

  const handleDeleteMessage = async (id) => {
    if(!window.confirm("Delete message?")) return;
    try {
        const res = await fetch(`${API_URL}/chat/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            setMessages(prev => prev.filter(m => m._id !== id));
            toast.success("Deleted");
        } else {
            toast.error("Unauthorized");
        }
    } catch(e) { toast.error("Error deleting"); }
  };

  // --- 2. IDEA LOGIC ---
  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    try {
        const res = await fetch(`${API_URL}/ideas`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIdeas(data);
    } catch (error) { toast.error("Failed to load ideas"); }
    finally { setLoadingIdeas(false); }
  };

  useEffect(() => {
    if(activeTab === 'ideas') fetchIdeas();
  }, [activeTab]);

  const handleCreateIdea = async (formData) => {
    try {
        const processedTags = formData.tags.split(',').map(t => t.trim());
        const res = await fetch(`${API_URL}/ideas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...formData, tags: processedTags })
        });
        
        if (!res.ok) throw new Error("Failed to create idea");
        
        const newIdea = await res.json();
        setIdeas([newIdea, ...ideas]);
        setShowIdeaModal(false);
        toast.success("Idea Launched!");
    } catch (error) { toast.error(error.message); }
  };

  // Join Team Handler
  const handleJoinTeam = async (idea) => {
      // If there is a link, open it
      if(idea.teamInviteLink) {
          window.open(idea.teamInviteLink, "_blank");
      } 
      
      // ALWAYS try to register join in backend (to add member + notify owner)
      try {
        const res = await fetch(`${API_URL}/ideas/${idea._id}/join`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if(res.ok) {
             if(!idea.teamInviteLink) toast.success(`Joined! The owner (${idea.postedBy?.name}) has been notified.`);
             // Refresh ideas to show new member count
             fetchIdeas();
        } else {
             // If already joined, just open link or show msg
             const data = await res.json();
             if(!idea.teamInviteLink) toast(data.message); 
        }
      } catch(e) { console.error(e); }
  };

  // Add Comment Handler
  const handleAddComment = async (ideaId, text) => {
    try {
        const res = await fetch(`${API_URL}/ideas/${ideaId}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text })
        });
        if(res.ok) {
            const data = await res.json();
            return data; // Returns updated comments
        }
    } catch (e) { toast.error("Failed to comment"); }
  };

  return (
    <div className="p-6 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-black mb-1">Build Hub</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Season 0 • Community</p>
        </div>
        
        {/* TAB SWITCHER */}
        <div className="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200 backdrop-blur-sm">
            <button 
                onClick={() => setActiveTab('ideas')} 
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'ideas' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Project Ideas
            </button>
            <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Global Chat
            </button>
        </div>
      </div>

      {/* --- CONTENT: PROJECT IDEAS --- */}
      {activeTab === 'ideas' && (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Open Projects</h2>
                <button 
                    onClick={() => setShowIdeaModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-gray-200"
                >
                    <FiPlus size={16} /> Post Idea
                </button>
            </div>

            {loadingIdeas ? (
                <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Projects...</div>
            ) : ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map(idea => (
                        <ProjectCard key={idea._id} idea={idea} onJoin={handleJoinTeam} onAddComment={handleAddComment} user={user} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold mb-2">No projects yet.</p>
                    <button onClick={() => setShowIdeaModal(true)} className="text-blue-600 font-bold text-sm hover:underline">Be the first to post!</button>
                </div>
            )}
            
            <CreateIdeaModal show={showIdeaModal} onClose={() => setShowIdeaModal(false)} onSave={handleCreateIdea} />
        </div>
      )}

      {/* --- CONTENT: GLOBAL CHAT --- */}
      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden h-full flex flex-col">
                {/* Chat Header */}
                <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <FiMessageSquare />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none">Season 0 Lobby</h3>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                    {messages.map((msg) => {
                        const isMe = msg.sender?._id === user._id;
                        const isAdmin = user?.role === 'admin';
                        return (
                            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <img src={msg.sender?.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full border border-gray-200 self-end mb-1" alt="avatar" />
                                
                                <div className={`relative max-w-[70%]`}>
                                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{msg.sender?.name}</span>
                                        <span className="text-[9px] text-gray-300">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    
                                    <div className={`group relative p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${isMe ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                        
                                        {/* Delete Action */}
                                        {(isMe || isAdmin) && (
                                            <button 
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className={`absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm`}
                                                title="Delete Message"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 transition-all outline-none text-sm font-medium"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className="bg-black text-white p-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 shadow-lg shadow-gray-300/50"
                    >
                        <FiSend size={18} />
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Community;