import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { getPostsApi, createPostApi, answerPostApi, deletePostApi } from "../../services/api.community";

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
    await onSave(form);
    setForm({ title: '', subject: '', body: '' });
    setIsSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Ask the Community</h2>
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
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g., React, JavaScript"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Details</label>
            <textarea
              rows="5"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Provide more details..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-70">
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
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button type="submit" className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black">
        Reply
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 relative group hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
        {getInitials(post.askedBy?.username)}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>

        {/* Meta info row */}
        <p className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-x-2">
          <span className="font-medium text-blue-600 bg-blue-100 py-0.5 px-2 rounded-full">{post.subject}</span>
          <span>• Posted by <span className="font-medium">{post.askedBy?.username || "Anonymous"}</span></span>
          <span>• {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>

        {/* Body */}
        <p className="text-gray-700 mt-3 whitespace-pre-wrap">{post.body}</p>

        {/* Replies */}
        <div className="mt-5">
          <h4 className="font-semibold text-gray-800 mb-2">Replies ({post.answers?.length || 0})</h4>
          <div className="space-y-3 border-l-2 border-gray-100 pl-4">
            {post.answers?.length > 0 ? (
              post.answers.map((answer, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">{answer.answeredBy?.username || "Anonymous"}</span> replied:
                  </p>
                  <p className="text-gray-700">{answer.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2">No replies yet.</p>
            )}
          </div>
          <AddReplyForm onSubmit={(t) => onAddReply(post._id, t)} />
        </div>
      </div>

      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={() => onDelete(post._id)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
        >
          <FiTrash2 size={18} />
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

  const loadPosts = async () => {
    try {
      const { data } = await getPostsApi();
      setPosts(data);
    } catch (e) {
      toast.error(e.message || "Failed to load posts.");
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
      toast.error(e.message || "Could not create post.");
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePostApi(id);
        toast.success('Post deleted.');
        loadPosts();
      } catch (e) {
        toast.error(e.message || "Failed to delete post.");
      }
    }
  };

  const handleAddReply = async (id, text) => {
    try {
      await answerPostApi(id, { text });
      toast.success('Reply added!');
      loadPosts();
    } catch (e) {
      toast.error(e.message || "Failed to add reply.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-sans p-4 sm:p-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black text-center md:text-left">
          Community Forum
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus size={18} />
          <span>Create Post</span>
        </button>
      </header>

      {/* Posts */}
      <main className="flex-1 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
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

      {/* Modal */}
      <PostFormModal show={showModal} onClose={() => setShowModal(false)} onSave={handleSavePost} />
    </div>
  );
}
