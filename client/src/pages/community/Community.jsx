import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiPlus, FiTrash2, FiX, FiSend, FiCode, FiMessageSquare, FiUsers, FiExternalLink, FiMail } from 'react-icons/fi';
import {
    getPostsApi,
    createPostApi,
    answerPostApi,
    deletePostApi,
    createIdeaApi,
    joinIdeaApi
} from "../../services/api.community.js";

// ========================
// Idea Card (Build Hub)
// ========================
const IdeaCard = ({ idea, currentUser, onJoin }) => {
    // Check if the current user is already a member
    const isMember = idea.members?.some(m => 
        (typeof m === 'string' ? m === currentUser?._id : m._id === currentUser?._id)
    );

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">
                        {idea.category || "Project Idea"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">{idea.title}</h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-gray-500">
                    <FiUsers size={12} />
                    <span className="text-[10px] font-bold">{idea.members?.length || 1} Members</span>
                </div>
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{idea.body || idea.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {idea.techStack?.map((tech, i) => (
                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {tech}
                    </span>
                ))}
            </div>

            {isMember ? (
                <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                        <FiMail size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Contact: {idea.askedBy?.email || "Team Member"}</span>
                    </div>
                    {idea.teamLink && (
                        <a 
                            href={idea.teamLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                        >
                            <FiExternalLink /> JOIN TEAM GROUP
                        </a>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-400 font-medium">
                        By <span className="text-gray-700 font-bold">{idea.askedBy?.username || "Builder"}</span>
                    </div>
                    <button 
                        onClick={() => onJoin(idea._id)}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black hover:-translate-y-1 transition-all shadow-lg shadow-black/10"
                    >
                        <FiPlus /> JOIN TEAM
                    </button>
                </div>
            )}
        </div>
    );
};

// ========================
// Post Card (Forum)
// ========================
const PostCard = ({ post, currentUser, onDelete, onAddReply }) => {
    const canDelete = currentUser && (currentUser.role === 'admin' || currentUser._id === post.askedBy?._id);
    const getInitials = (name = "") => (name.charAt(0) || '?').toUpperCase();

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 relative group hover:border-gray-200 transition-all shadow-sm">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {getInitials(post.askedBy?.username)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.subject}</span>
                        <span className="text-gray-200">•</span>
                        <span className="text-[10px] font-bold text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.body}</p>
                    
                    <div className="space-y-2 mb-4">
                        {post.answers?.map((ans, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-700 border border-gray-100">
                                <span className="font-bold text-black">{ans.answeredBy?.username}:</span> {ans.text}
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const text = e.target.reply.value;
                        if(text.trim()) { onAddReply(post._id, text); e.target.reset(); }
                    }} className="flex gap-2">
                        <input name="reply" placeholder="Share your insight..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-black" />
                        <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:scale-105 transition-all shadow-md"><FiSend size={14}/></button>
                    </form>
                </div>
            </div>
            {canDelete && (
                <button onClick={() => onDelete(post._id)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <FiTrash2 size={16} />
                </button>
            )}
        </div>
    );
};

// ========================
// Post & Idea Form Modal
// ========================
const PostFormModal = ({ show, onClose, onSave }) => {
    const [type, setType] = useState('question');
    const [form, setForm] = useState({ 
        title: '', subject: '', body: '', techStack: '', lookingFor: '', category: 'Web App', teamLink: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.body) return toast.error('Required fields missing.');
        setIsSubmitting(true);
        try {
            const payload = type === 'idea' ? {
                ...form,
                type: 'idea',
                techStack: form.techStack.split(',').map(s => s.trim()).filter(s => s),
                lookingFor: form.lookingFor.split(',').map(s => s.trim()).filter(s => s)
            } : { ...form, type: 'question' };
            await onSave(payload);
            setForm({ title: '', subject: '', body: '', techStack: '', lookingFor: '', category: 'Web App', teamLink: '' });
        } finally { setIsSubmitting(false); }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-[32px] w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black tracking-tight">Post Content</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={24} /></button>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
                    <button onClick={() => setType('question')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'question' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>FORUM QUESTION</button>
                    <button onClick={() => setType('idea')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'idea' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>BUILD IDEA</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                        <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Give it a clear title..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none focus:border-black" />
                    </div>

                    {type === 'idea' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm">
                                        <option>Web App</option><option>Mobile App</option><option>AI/ML</option><option>Blockchain</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stack (CSV)</label>
                                    <input type="text" value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} placeholder="MERN, Java..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Team Link (Discord/WA)</label>
                                <input type="text" value={form.teamLink} onChange={e => setForm({...form, teamLink: e.target.value})} placeholder="Private link for team members..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none" />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                            <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Java, Web Development" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Details</label>
                        <textarea rows="4" value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 outline-none resize-none" placeholder="Explain your vision or question..." />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-black/20 hover:-translate-y-1 transition-all disabled:opacity-50">
                        {isSubmitting ? 'UPLOADING...' : 'PUBLISH TO COMMUNITY'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ========================
// Main Page Component
// ========================
export default function CommunityPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Build Hub");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const { data } = await getPostsApi();
            setPosts(Array.isArray(data) ? data : data?.posts || []);
        } catch (e) { toast.error("Sync failed."); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPosts(); }, []);

    const handleSave = async (payload) => {
        try {
            if (payload.type === 'idea') {
                await createIdeaApi(payload);
                toast.success("Idea launched!");
            } else {
                await createPostApi(payload);
                toast.success("Question posted!");
            }
            setShowModal(false);
            loadPosts();
        } catch (e) { toast.error("Publish failed."); }
    };

    const handleJoin = async (id) => {
        try {
            await joinIdeaApi(id);
            toast.success("Welcome to the team!");
            loadPosts();
        } catch (e) { toast.error("Unable to join team."); }
    };

    return (
        <div className="w-full min-h-screen text-gray-900 bg-transparent px-2">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-3">Community Hub</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Solve. Collaborate. Build.</p>
                </div>
                
                <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                    <button onClick={() => setActiveTab("Build Hub")} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === "Build Hub" ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-black"}`}>
                        <FiCode /> Build Hub
                    </button>
                    <button onClick={() => setActiveTab("Forum")} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === "Forum" ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-black"}`}>
                        <FiMessageSquare /> Forum
                    </button>
                </div>
            </header>

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Pool: {posts.length + 12}+ Builders</span>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:-translate-y-1 transition-all shadow-2xl shadow-black/30">
                    <FiPlus /> POST NEW
                </button>
            </div>

            <main className="w-full pb-20">
                {loading ? (
                    <div className="py-20 text-center animate-pulse"><p className="font-black text-xs tracking-widest text-gray-300">SYNCING ENGINE...</p></div>
                ) : activeTab === "Build Hub" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {posts.filter(p => p.type === 'idea').map(idea => (
                            <IdeaCard key={idea._id} idea={idea} currentUser={user} onJoin={handleJoin} />
                        ))}
                        {posts.filter(p => p.type === 'idea').length === 0 && (
                            <div className="col-span-full py-32 text-center bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                                <p className="font-black text-gray-300 tracking-widest uppercase text-xs">No active projects. Lead the charge.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {posts.filter(p => p.type !== 'idea').map(p => (
                            <PostCard key={p._id} post={p} currentUser={user} onDelete={loadPosts} onAddReply={loadPosts} />
                        ))}
                    </div>
                )}
            </main>

            <PostFormModal show={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
        </div>
    );
}