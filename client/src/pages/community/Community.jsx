import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiPlus, FiTrash2, FiX, FiSend } from 'react-icons/fi';
import {
    getPostsApi,
    createPostApi,
    answerPostApi,
    deletePostApi
} from "../../services/api.community.js";

// ========================
// Post Form Modal
// ========================
const PostFormModal = ({ show, onClose, onSave }) => {
    const [form, setForm] = useState({ title: '', subject: '', body: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.body || !form.subject) {
            return toast.error('All fields are required.');
        }
        setIsSubmitting(true);
        try {
            await onSave(form);
            setForm({ title: '', subject: '', body: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ask the Community</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <FiX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="What's your question?"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            placeholder="e.g., React, JavaScript"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Details</label>
                        <textarea
                            rows="5"
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            placeholder="Provide more details..."
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm">
                            {isSubmitting ? 'Posting...' : 'Post Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ========================
// Reply Form
// ========================
const AddReplyForm = ({ onSubmit }) => {
    const [text, setText] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText("");
    };
    return (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button type="submit" className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <FiSend size={16} />
            </button>
        </form>
    );
};

// ========================
// Post Card
// ========================
const PostCard = ({ post, currentUser, onDelete, onAddReply }) => {
    const canDelete = currentUser && (currentUser.role === 'admin' || currentUser._id === post.askedBy?._id);
    const getInitials = (name = "") => (name.charAt(0) || '?').toUpperCase();
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 relative group hover:shadow-lg transition-shadow">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                {getInitials(post.askedBy?.username)}
            </div>

            <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{post.title}</h3>
                <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500 gap-y-1 sm:gap-x-2">
                    <span className="font-medium text-blue-600 bg-blue-100 py-0.5 px-2 rounded-full text-xs">{post.subject}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">• Posted by <span className="font-medium text-gray-700">{post.askedBy?.username || "Anonymous"}</span></span>
                    <span className="text-gray-500 text-xs sm:text-sm">• {new Date(post.createdAt).toLocaleDateString('en-US', dateOptions)}</span>
                </div>
                <p className="text-gray-700 mt-3 text-sm whitespace-pre-wrap">{post.body}</p>

                <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Replies ({post.answers?.length || 0})</h4>
                    <div className="space-y-3 border-l-2 border-gray-100 pl-4">
                        {post.answers?.length > 0 ? (
                            post.answers.map((answer, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">
                                        <span className="font-semibold text-gray-800">{answer.answeredBy?.username || "Anonymous"}</span> replied:
                                    </p>
                                    <p className="text-sm text-gray-700">{answer.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-2">No replies yet.</p>
                        )}
                    </div>
                    <AddReplyForm onSubmit={(t) => onAddReply(post._id, t)} />
                </div>
            </div>

            {canDelete && (
                <button
                    onClick={() => onDelete(post._id)}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 
                   opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                    <FiTrash2 size={16} />
                </button>
            )}
        </div>
    );
};

// ========================
// Community Page
// ========================
export default function CommunityPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const handleApiError = (e, defaultMessage = "Something went wrong.") => {
        if (e.response) {
            if (typeof e.response.data === "string" && e.response.data.includes("<!DOCTYPE")) {
                toast.error("Server returned an unexpected response.");
                console.error("API returned HTML instead of JSON:", e.response.data);
            } else {
                toast.error(e.response.data.message || defaultMessage);
            }
        } else {
            toast.error(defaultMessage);
        }
    };

    const loadPosts = async () => {
        setLoading(true);
        try {
            const { data } = await getPostsApi();
            setPosts(data);
        } catch (e) {
            handleApiError(e, "Failed to load posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);

    const handleSavePost = async (formData) => {
        try {
            await createPostApi(formData);
            toast.success("Your question has been posted!");
            setShowModal(false);
            loadPosts();
        } catch (e) {
            handleApiError(e, "Could not create post.");
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await deletePostApi(id);
            toast.success('Post deleted.');
            loadPosts();
        } catch (e) {
            handleApiError(e, "Failed to delete post.");
        }
    };

    const handleAddReply = async (id, text) => {
        try {
            await answerPostApi(id, { text });
            toast.success('Reply added!');
            loadPosts();
        } catch (e) {
            handleApiError(e, "Failed to add reply.");
        }
    };

    return (
        <div className="w-full h-full flex flex-col font-sans p-0 md:p-6 sm:p-6 ">
            <div className="w-full lg:max-w-none mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black text-center md:text-left">Community Forum</h1>
                    {/* The single button for both views */}
                    <button
                        onClick={() => setShowModal(true)}
                        // Make it full-width on mobile and auto on desktop
                        className="w-full md:w-auto flex items-center justify-center md:justify-start gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <FiPlus size={18} />
                        <span>Create Post</span>
                    </button>
                </header>

                <main className="flex-1 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading posts...</p>
                    ) : posts.length > 0 ? (
                        posts.map(p => (
                            <PostCard key={p._id} post={p} currentUser={user} onDelete={handleDeletePost} onAddReply={handleAddReply} />
                        ))
                    ) : (
                        <div className="text-center p-10 bg-gray-100 rounded-2xl">
                            <h3 className="text-xl font-semibold text-black">No Questions Yet</h3>
                            <p className="text-gray-600 mt-2">Be the first to ask a question!</p>
                        </div>
                    )}
                </main>
            </div>

            <PostFormModal show={showModal} onClose={() => setShowModal(false)} onSave={handleSavePost} />
        </div>
    );
}