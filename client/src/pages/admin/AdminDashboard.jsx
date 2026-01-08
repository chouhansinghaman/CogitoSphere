import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCopy, FiCheckCircle, FiXCircle, FiUser, FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  // --- DELETE STATE ---
  const [userToDelete, setUserToDelete] = useState(null); // Stores the user object selected for deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState(""); // Stores what the admin types
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch All Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load builders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home'); 
      return;
    }
    fetchUsers();
  }, [user, token, navigate, API_URL]);

  // 2. Handle Delete Logic
  const handleDeleteSubmit = async () => {
    if (!userToDelete) return;
    
    // Safety Check (Frontend)
    if (deleteConfirmation !== userToDelete.username) {
      return toast.error("Username does not match!");
    }

    setIsDeleting(true);
    try {
      // Make sure this route exists in your backend!
      const res = await fetch(`${API_URL}/users/admin/${userToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(`User ${userToDelete.name} deleted.`);
      
      // Remove from local list so we don't need to refetch
      setUsers(users.filter(u => u._id !== userToDelete._id));
      
      // Close Modal
      setUserToDelete(null);
      setDeleteConfirmation("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.builderProfile?.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterActive ? u.builderProfile?.lookingForTeam : true;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    activePool: users.filter(u => u.builderProfile?.lookingForTeam).length,
    verified: users.filter(u => u.studyStreak > 5).length
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-xs tracking-widest text-zinc-400">LOADING DATA...</div>;

  return (
    <div className="w-full min-h-screen bg-white text-zinc-900 font-sans p-6 sm:p-10 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Builder Scout</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Admin Console • Manual Matching</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Users</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-green-50 px-5 py-3 rounded-2xl border border-green-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Active Pool</p>
            <p className="text-2xl font-black text-green-700">{stats.activePool}</p>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by Name or Skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-zinc-50 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
        <button 
          onClick={() => setFilterActive(!filterActive)}
          className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 transition-all ${filterActive ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black'}`}
        >
          {filterActive ? "Show All" : "Show Active Only"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Builder</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role & Stack</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar || "https://via.placeholder.com/40"} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{u.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="mb-2">
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">{u.builderProfile?.preferredRole || "Undecided"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {u.builderProfile?.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-2 py-1 rounded-md">{skill}</span>
                        ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {u.builderProfile?.lookingForTeam ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-full"><FiCheckCircle size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Active</span></div>
                    ) : (
                        <div className="flex items-center gap-2 text-zinc-400 w-fit px-3 py-1.5"><FiXCircle size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Inactive</span></div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => copyToClipboard(u.email)} className="text-zinc-400 hover:text-black p-2 rounded-full hover:bg-zinc-100 transition-all"><FiCopy /></button>
                    <button onClick={() => navigate(`/u/${u._id}`)} className="text-zinc-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all"><FiUser /></button>
                    
                    {/* DELETE BUTTON - Opens Modal */}
                    {u.role !== 'admin' && (
                        <button 
                            onClick={() => { setUserToDelete(u); setDeleteConfirmation(""); }} 
                            className="text-zinc-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                            title="Delete User"
                        >
                            <FiTrash2 />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200 border-2 border-red-100">
                <button 
                    onClick={() => setUserToDelete(null)} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-black"
                >
                    <FiX size={24}/>
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <FiAlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Delete User?</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        This will permanently remove <strong>{userToDelete.name}</strong> and all their data. This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Type <span className="text-black select-all">"{userToDelete.username}"</span> to confirm
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={userToDelete.username}
                        />
                    </div>

                    <button 
                        onClick={handleDeleteSubmit}
                        disabled={deleteConfirmation !== userToDelete.username || isDeleting}
                        className="w-full py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200"
                    >
                        {isDeleting ? "Deleting..." : "I understand, delete this user"}
                    </button>

                    <button 
                        onClick={() => setUserToDelete(null)}
                        className="w-full py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;