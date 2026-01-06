import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiPlus, FiTrash2, FiX, FiSend, FiCode, FiMessageSquare, FiUsers } from 'react-icons/fi';
import {
    getPostsApi,
    createPostApi,
    answerPostApi,
    deletePostApi
} from "../../services/api.community.js";

// ========================
// Idea Card (Build Space)
// ========================
const IdeaCard = ({ idea, currentUser, onJoin }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">
                        {idea.category || "Project Idea"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">{idea.title}</h3>
                </div>
                <div className="flex -space-x-2">
                    {/* Placeholder for member avatars */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        +{idea.members?.length || 1}
                    </div>
                </div>
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{idea.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {idea.techStack?.map((tech, i) => (
                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {tech}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-xs text-gray-400">
                    By <span className="font-bold text-gray-700">{idea.postedBy?.username}</span>
                </div>
                <button 
                    onClick={() => onJoin(idea._id)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                >
                    <FiPlus /> Join Team
                </button>
            </div>
        </div>
    );
};

// ========================
// Original Post Card (Q&A)
// ========================
const PostCard = ({ post, currentUser, onDelete, onAddReply }) => {
    const canDelete = currentUser && (currentUser.role === 'admin' || currentUser._id === post.askedBy?._id);
    const getInitials = (name = "") => (name.charAt(0) || '?').toUpperCase();

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 relative group hover:border-gray-300 transition-all">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {getInitials(post.askedBy?.username)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.subject}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-bold text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{post.body}</p>
                    
                    <div className="space-y-2">
                        {post.answers?.map((ans, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700">
                                <span className="font-bold">{ans.answeredBy?.username}:</span> {ans.text}
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const text = e.target.reply.value;
                        if(text.trim()) { onAddReply(post._id, text); e.target.reset(); }
                    }} className="mt-4 flex gap-2">
                        <input name="reply" placeholder="Write a reply..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-black" />
                        <button className="p-2 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"><FiSend size={14}/></button>
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
// Integrated Community Page
// ========================
export default function CommunityPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Build Hub"); // Default to Build Hub
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const { data } = await getPostsApi();
            setPosts(data);
        } catch (e) { toast.error("Failed to sync community data."); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPosts(); }, []);

    return (
        <div className="w-full min-h-screen text-gray-900">
            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Community</h1>
                    <p className="text-gray-400 font-medium">Solve doubts or build the next big thing.</p>
                </div>
                
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab("Build Hub")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "Build Hub" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
                    >
                        <FiCode /> Build Hub
                    </button>
                    <button 
                        onClick={() => setActiveTab("Forum")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "Forum" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
                    >
                        <FiMessageSquare /> Q&A Forum
                    </button>
                </div>
            </header>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-gray-400">
                    <FiUsers />
                    <span className="text-xs font-bold uppercase tracking-widest">50+ Builders Online</span>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black text-xs hover:-translate-y-1 transition-all shadow-xl shadow-black/10"
                >
                    <FiPlus /> {activeTab === "Build Hub" ? "Post an Idea" : "Ask Question"}
                </button>
            </div>

            {/* Content Area */}
            <main className="w-full">
                {loading ? (
                    <div className="flex flex-col items-center py-20 opacity-20">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-black text-xs tracking-widest uppercase">Syncing Community...</p>
                    </div>
                ) : activeTab === "Build Hub" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* We will map IdeaCard here once Backend is ready */}
                        {posts.filter(p => p.type === 'idea').length > 0 ? (
                             posts.filter(p => p.type === 'idea').map(idea => <IdeaCard key={idea._id} idea={idea} />)
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed">
                                <p className="font-bold text-gray-400">No projects in the hub yet. Be the first to lead!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl">
                        {posts.map(p => (
                            <PostCard key={p._id} post={p} currentUser={user} onDelete={deletePostApi} onAddReply={answerPostApi} />
                        ))}
                    </div>
                )}
            </main>

            {/* We'll update this modal next to handle both Ideas and Questions */}
            {/* <PostFormModal show={showModal} ... /> */}
        </div>
    );
}