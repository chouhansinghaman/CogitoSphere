import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCopy, FiCheckCircle, FiXCircle, FiCpu, FiUser } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  // 1. Fetch All Users
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home'); // Security redirect
      return;
    }

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
    fetchUsers();
  }, [user, token, navigate, API_URL]);

  // 2. Filter Logic (Search by Name or Skill)
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.builderProfile?.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterActive ? u.builderProfile?.lookingForTeam : true;

    return matchesSearch && matchesStatus;
  });

  // 3. Stats Calculation
  const stats = {
    total: users.length,
    activePool: users.filter(u => u.builderProfile?.lookingForTeam).length,
    verified: users.filter(u => u.studyStreak > 5).length // "Serious" builders
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-xs tracking-widest text-zinc-400">LOADING DATA...</div>;

  return (
    <div className="w-full min-h-screen bg-white text-zinc-900 font-sans p-6 sm:p-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Builder Scout</h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Admin Console • Manual Matching</p>
        </div>
        
        {/* Quick Stats */}
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
            placeholder="Search by Name or Skill (e.g. 'React')..." 
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
                  
                  {/* USER INFO */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={u.avatar || "https://via.placeholder.com/40"} 
                        alt="avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200" 
                      />
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{u.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKILLS */}
                  <td className="px-8 py-6">
                    <div className="mb-2">
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                            {u.builderProfile?.preferredRole || "Undecided"}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {u.builderProfile?.skills?.length > 0 ? (
                            u.builderProfile.skills.map((skill, i) => (
                                <span key={i} className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-2 py-1 rounded-md">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-300 italic">No skills listed</span>
                        )}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-8 py-6">
                    {u.builderProfile?.lookingForTeam ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-full">
                            <FiCheckCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Pool</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-zinc-400 w-fit px-3 py-1.5">
                            <FiXCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Inactive</span>
                        </div>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-8 py-6 text-right">
                    <button 
                        onClick={() => copyToClipboard(u.email)}
                        className="text-zinc-400 hover:text-black p-2 rounded-full hover:bg-zinc-100 transition-all"
                        title="Copy Email"
                    >
                        <FiCopy />
                    </button>
                    <button 
                        onClick={() => navigate(`/profile/${u._id}`)} // Assuming you make a public profile view later
                        className="text-zinc-400 hover:text-black p-2 rounded-full hover:bg-zinc-100 transition-all ml-2"
                        title="View Profile"
                    >
                        <FiUser />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
            <div className="text-center py-20">
                <p className="text-zinc-400 font-bold text-sm">No builders found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;