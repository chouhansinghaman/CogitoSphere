import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { SEASON_CONFIG } from "../../lib/SeasonConfig.js"; 
import { 
  FiSend, FiTrash2, FiMessageSquare, FiPlus, FiX, 
  FiArrowRight, FiEdit2, FiLogOut, FiUsers
} from "react-icons/fi";

// --- SUB-COMPONENT: View Team Modal ---
const TeamModal = ({ members, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><FiUsers /> Team Members</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black"><FiX /></button>
                </div>
                
                <div className="space-y-3">
                    {members && members.length > 0 ? (
                        members.map(m => (
                            <div key={m._id || Math.random()} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <img 
                                    src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m._id || "unknown"}`} 
                                    className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-100"
                                    alt="avatar"
                                />
                                <div>
                                    <span className="font-bold text-sm text-gray-900 block">{m.name || "Unknown Builder"}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Member</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No members found.</p>
                    )}
                </div>
                
                <button onClick={onClose} className="mt-6 w-full py-3 bg-black text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity">
                    Close
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Project Card ---
const ProjectCard = ({ idea, onJoin, onLeave, onDelete, onEdit, onAddComment, user }) => {
  const [showComments, setShowComments] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(idea.comments || []);
  
  const isMember = idea.members?.some(m => m._id === user._id);
  const isOwner = idea.postedBy?._id === user._id;
  const isAdmin = user.role === 'admin';

  const handlePostComment = async (e) => {
    e.preventDefault();
    if(!commentText.trim()) return;
    const updatedComments = await onAddComment(idea._id, commentText);
    if(updatedComments) {
        setLocalComments(updatedComments);
        setCommentText("");
    }
  };

  return (
    <div className="group relative w-full h-full flex flex-col">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
        
        <div className="absolute top-4 right-4 flex gap-2 z-10">
            {isOwner && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(idea); }} className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors" title="Edit Idea">
                    <FiEdit2 size={14} />
                </button>
            )}
            {(isOwner || isAdmin) && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(idea._id); }} className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-100 rounded-lg transition-colors" title="Delete Idea">
                    <FiTrash2 size={14} />
                </button>
            )}
        </div>

        {!showComments ? (
            <>
                <div>
                    <button 
                        onClick={() => setShowTeamModal(true)}
                        className="flex items-center gap-2 mb-4 group/team hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-colors"
                    >
                         <div className="flex -space-x-2">
                            {idea.members?.slice(0,3).map((m, i) => (
                                <img 
                                    key={i} 
                                    src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m._id}`} 
                                    alt={m.name} 
                                    className="w-6 h-6 rounded-full border-2 border-white object-cover bg-gray-100" 
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase group-hover/team:text-black transition-colors">
                            {idea.members?.length || 0} Builders
                        </span>
                    </button>
                    
                    <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight pr-12">
                        {idea.title}
                    </h3>
                    
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
                        {isOwner ? (
                             <button 
                                onClick={() => setShowTeamModal(true)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                             >
                                <FiUsers /> View Team
                             </button>
                        ) : isMember ? (
                            <div className="flex-1 flex gap-1">
                                <button className="flex-1 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-xs uppercase cursor-default border border-green-100">
                                    Joined
                                </button>
                                <button 
                                    onClick={() => onLeave(idea._id)}
                                    className="px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors"
                                    title="Leave Team"
                                >
                                    <FiLogOut />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => onJoin(idea)}
                                className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                            >
                                {idea.teamInviteLink ? "Open Link" : "Join Team"} <FiArrowRight />
                            </button>
                        )}
                        
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
            <div className="flex-1 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">Discussion</h4>
                    <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-full"><FiX /></button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-[150px] space-y-3 mb-4 pr-1 scrollbar-thin">
                    {localComments.length === 0 && <div className="text-center py-4 text-xs text-gray-300 italic">No comments yet.</div>}
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
                    <input type="text" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none" placeholder="Message..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                    <button type="submit" className="bg-black text-white p-2.5 rounded-xl hover:opacity-80"><FiSend size={12}/></button>
                </form>
            </div>
        )}
      </div>

      {showTeamModal && <TeamModal members={idea.members} onClose={() => setShowTeamModal(false)} />}
    </div>
  );
};

// --- SUB-COMPONENT: Create/Edit Modal (Updated with Red Asterisks) ---
const IdeaModal = ({ show, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ title: "", description: "", tags: "", teamInviteLink: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                tags: initialData.tags.join(", "),
                teamInviteLink: initialData.teamInviteLink || ""
            });
        } else {
            setFormData({ title: "", description: "", tags: "", teamInviteLink: "" });
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black"><FiX size={24}/></button>
                <h2 className="text-2xl font-black mb-1">{initialData ? "Edit Project" : "Post Project"}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Project Title <span className="text-red-500">*</span>
                        </label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea required rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Tech Stack (Comma separated) <span className="text-red-500">*</span>
                        </label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group Link (Optional)</label>
                        <input type="url" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-black outline-none text-sm" placeholder="https://..." value={formData.teamInviteLink} onChange={e => setFormData({...formData, teamInviteLink: e.target.value})} />
                    </div>
                    
                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform mt-4">
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
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null); 
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // --- 1. CHAT LOGIC ---
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } });
      if(res.ok) setMessages(await res.json());
    } catch (error) { console.error(error); }
  };
  useEffect(() => {
    if (activeTab === 'chat') {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }
  }, [activeTab]);
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

  useEffect(() => { if(activeTab === 'ideas') fetchIdeas(); }, [activeTab]);

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
        
        if(isEdit) {
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
      if(!window.confirm("Delete this project?")) return;
      try {
          const res = await fetch(`${API_URL}/ideas/${id}`, {
              method: "DELETE", headers: { Authorization: `Bearer ${token}` }
          });
          if(res.ok) {
              setIdeas(ideas.filter(i => i._id !== id));
              toast.success("Deleted");
          } else { toast.error("Unauthorized"); }
      } catch(e) { toast.error("Error deleting"); }
  };

  const handleJoinTeam = async (idea) => {
      if(idea.teamInviteLink) window.open(idea.teamInviteLink, "_blank");
      try {
        const res = await fetch(`${API_URL}/ideas/${idea._id}/join`, {
            method: "PUT", headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
             if(!idea.teamInviteLink) toast.success("Joined!");
             fetchIdeas();
        }
      } catch(e) { console.error(e); }
  };

  const handleLeaveTeam = async (id) => {
      if(!window.confirm("Leave this team?")) return;
      try {
        const res = await fetch(`${API_URL}/ideas/${id}/leave`, {
            method: "PUT", headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
             toast.success("Left team");
             fetchIdeas();
        }
      } catch(e) { console.error(e); }
  };

  const handleAddComment = async (ideaId, text) => { 
      try {
        const res = await fetch(`${API_URL}/ideas/${ideaId}/comment`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text })
        });
        if(res.ok) return await res.json();
      } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="p-6 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-black mb-1">Build Hub</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Season 0 • Community</p>
        </div>
        <div className="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200 backdrop-blur-sm">
            <button onClick={() => setActiveTab('ideas')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'ideas' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Project Ideas</button>
            <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Global Chat</button>
        </div>
      </div>

      {activeTab === 'ideas' && (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Open Projects</h2>
                {SEASON_CONFIG.ALLOW_NEW_IDEAS ? (
                    <button onClick={() => { setEditingIdea(null); setShowIdeaModal(true); }} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-gray-200"><FiPlus size={16} /> Post Idea</button>
                ) : (
                    <div className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs border border-gray-200 cursor-not-allowed">Ideas Locked 🔒</div>
                )}
            </div>

            {loadingIdeas ? (
                <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</div>
            ) : ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map(idea => (
                        <ProjectCard 
                            key={idea._id} idea={idea} user={user}
                            onJoin={handleJoinTeam} onLeave={handleLeaveTeam} 
                            onDelete={handleDeleteIdea} onEdit={(idea) => { setEditingIdea(idea); setShowIdeaModal(true); }}
                            onAddComment={handleAddComment} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200"><p className="text-gray-400 font-bold mb-2">No projects yet.</p></div>
            )}
            
            <IdeaModal show={showIdeaModal} initialData={editingIdea} onClose={() => setShowIdeaModal(false)} onSave={handleSaveIdea} />
        </div>
      )}

      {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden h-full flex flex-col">
                <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><FiMessageSquare /></div>
                        <div><h3 className="font-bold text-gray-900 leading-none">Season 0 Lobby</h3><span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`flex gap-3 ${msg.sender?._id === user._id ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.sender?.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full border border-gray-200 self-end mb-1"/>
                            <div className={`relative max-w-[70%] group`}>
                                <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user._id ? 'justify-end' : ''}`}><span className="text-[10px] font-bold text-gray-400 uppercase">{msg.sender?.name}</span></div>
                                <div className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.sender?._id === user._id ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
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