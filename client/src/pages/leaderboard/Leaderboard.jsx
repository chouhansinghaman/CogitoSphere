import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaCrown, FaMedal, FaCode, FaBrain, FaTrophy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AlphaBadge from "../../components/AlphaBadge";

const Leaderboard = () => {
  const { user, token } = useAuth(); // Added token from context
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' or 'projects'
  
  // Data States
  const [quizLeaders, setQuizLeaders] = useState([]);
  const [projectLeaders, setProjectLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- FETCHING LOGIC ---
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "quiz") {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setQuizLeaders(data || []);
      } else {
        const res = await fetch(`${API_URL}/projects`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        
        // Sort Projects: Ranks 1, 2, 3 first, then the rest
        const sorted = data.sort((a, b) => {
            if (a.seasonRank > 0 && b.seasonRank > 0) return a.seasonRank - b.seasonRank;
            if (a.seasonRank > 0) return -1;
            if (b.seasonRank > 0) return 1;
            return 0; // Keep original order for unranked
        });
        setProjectLeaders(sorted);
      }
    } catch (err) {
      toast.error(err.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, activeTab]);

  // --- ADMIN ACTIONS ---

  // 1. Remove Quiz Data (From Code 1)
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student's data?")) return;
    try {
      const res = await fetch(`${API_URL}/leaderboard/user/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to remove student data");
      toast.success("Student's leaderboard data removed!");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Error removing student data");
    }
  };

  // 2. Rank Project (From Code 2)
  const handleSetRank = async (projectId, rank) => {
    try {
        const res = await fetch(`${API_URL}/projects/${projectId}/rank`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ rank })
        });
        
        if (res.ok) {
            toast.success(rank === 0 ? "Rank Removed" : `Awarded Rank #${rank}! 🏆`);
            fetchData();
        } else {
            throw new Error("Failed to update rank");
        }
    } catch (e) {
        toast.error(e.message);
    }
  };

  // --- PREPARE DATA FOR VIEW ---
  const currentData = activeTab === "quiz" ? quizLeaders : projectLeaders;

  // For Podium: 
  // If Quiz: Top 3 by array index.
  // If Project: Explicitly filter by seasonRank 1, 2, 3.
  const getPodiumData = () => {
    if (activeTab === "quiz") return quizLeaders.slice(0, 3);
    
    // For projects, we manually slot them into 1st, 2nd, 3rd positions for the podium array
    const rank1 = projectLeaders.find(p => p.seasonRank === 1);
    const rank2 = projectLeaders.find(p => p.seasonRank === 2);
    const rank3 = projectLeaders.find(p => p.seasonRank === 3);
    
    // Filter out undefined if a rank isn't assigned yet
    return [rank1, rank2, rank3].filter(Boolean).sort((a,b) => a.seasonRank - b.seasonRank);
  };

  const podiumItems = getPodiumData();
  
  // For Table:
  // If Quiz: Index 3 onwards.
  // If Project: Everyone else (seasonRank === 0).
  const tableItems = activeTab === "quiz" 
    ? quizLeaders.slice(3) 
    : projectLeaders.filter(p => !p.seasonRank || p.seasonRank === 0);


  // --- STYLES HELPER ---
  const getPodiumStyle = (index) => {
    // Note: This logic assumes the array is sorted [1st, 2nd, 3rd]
    // But logically, visually:
    // Index 0 (Rank 1) -> Gold (Center)
    // Index 1 (Rank 2) -> Silver (Left)
    // Index 2 (Rank 3) -> Bronze (Right)
    
    // We use CSS Grid/Flex order to swap them visually
    switch (index) {
      case 0: // 🥇 GOLD (Rank 1)
        return "order-1 sm:order-2 z-20 scale-105 sm:scale-110 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-gradient-to-b from-yellow-50 to-white";
      case 1: // 🥈 SILVER (Rank 2)
        return "order-2 sm:order-1 border-slate-300 shadow-xl bg-white mt-4 sm:mt-0";
      case 2: // 🥉 BRONZE (Rank 3)
        return "order-3 sm:order-3 border-orange-300 shadow-xl bg-white mt-8 sm:mt-0";
      default:
        return "bg-white border-zinc-100";
    }
  };

  const getMedalIcon = (index) => {
    if (index === 0) return <FaCrown className="text-yellow-400 drop-shadow-md text-3xl" />;
    if (index === 1) return <FaMedal className="text-slate-400 text-2xl" />;
    if (index === 2) return <FaMedal className="text-orange-400 text-2xl" />;
    return null;
  };

  return (
    <motion.div
      className="w-full min-h-screen font-sans text-gray-800 pb-20"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.1 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        
        {/* --- HEADER --- */}
        <header className="text-center mb-10 pt-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100"
          >
            <FaCrown /> Season 0 Leaderboard
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black mb-4 text-zinc-900 tracking-tight"
          >
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Fame.</span>
          </motion.h1>
          
          {/* TAB SWITCHER */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-8 mb-4"
          >
             <div className="inline-flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 gap-1">
                <button 
                    onClick={() => setActiveTab('quiz')} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'quiz' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    <FaBrain size={14} /> Quiz Arena
                </button>
                <button 
                    onClick={() => setActiveTab('projects')} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'projects' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    <FaCode size={14} /> Projects
                </button>
            </div>
          </motion.div>
        </header>

        {/* --- LOADING STATE --- */}
        {loading ? (
           <div className="flex flex-col justify-center items-center w-full h-[40vh] text-zinc-400">
             <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Summoning Champions...</p>
           </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {/* --- EMPTY STATE --- */}
                {!currentData.length && (
                    <div className="flex flex-col justify-center items-center w-full h-full p-4">
                        <div className="text-center bg-zinc-50 p-10 rounded-[2rem] border border-zinc-200">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            {activeTab === 'quiz' ? '🏆' : '💻'}
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-2">The Arena is Empty</h2>
                        <p className="text-zinc-500 font-medium">Be the first to {activeTab === 'quiz' ? 'take a quiz' : 'submit a project'} and claim the top spot!</p>
                        </div>
                    </div>
                )}

                {/* --- PODIUM SECTION (TOP 3) --- */}
                {podiumItems.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-6 mb-16">
                    {podiumItems.map((item, index) => (
                        <motion.div
                        key={item._id || index}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-6 rounded-[2rem] border-2 text-center w-full sm:w-[30%] flex flex-col items-center ${getPodiumStyle(index)}`}
                        >
                        {/* Rank Badge Absolute */}
                        <div className="absolute -top-4 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                            {index + 1}
                        </div>

                        {/* Medal Icon */}
                        <div className="mb-4">{getMedalIcon(index)}</div>

                        {/* Avatar / Project Image */}
                        <div className="relative mb-4 w-full flex justify-center">
                             {activeTab === 'quiz' ? (
                                <>
                                    <img 
                                        src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random`} 
                                        alt={item.name}
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-zinc-100"
                                    />
                                    {index === 0 && <div className="absolute -bottom-2 right-1/3 text-2xl animate-bounce">🔥</div>}
                                </>
                             ) : (
                                <img 
                                    src={item.image || "https://via.placeholder.com/150"} 
                                    alt={item.title}
                                    className="w-full h-32 object-cover rounded-xl border-2 border-zinc-100 shadow-sm"
                                />
                             )}
                        </div>

                        {/* User Info / Project Info */}
                        <h3 className="text-lg font-bold text-zinc-900 truncate w-full px-2">
                            {activeTab === 'quiz' ? item.name : item.title}
                        </h3>
                        
                        {activeTab === 'quiz' ? (
                             <p className="text-xs text-zinc-400 font-bold mb-2">@{item.username || "builder"}</p>
                        ) : (
                             <div className="flex items-center gap-1 mb-2 justify-center">
                                <span className="text-xs text-zinc-400 font-bold">by {item.user?.name}</span>
                                <AlphaBadge className="scale-[0.6]" />
                             </div>
                        )}
                        
                        {activeTab === 'quiz' && (
                             <div className="flex items-center gap-2 mb-4">
                                <AlphaBadge />
                             </div>
                        )}

                        {/* Stats / Actions */}
                        <div className="w-full bg-zinc-50 rounded-xl p-3 border border-zinc-100 mt-auto">
                            {activeTab === 'quiz' ? (
                                <>
                                    <p className="text-3xl font-black text-indigo-600 leading-none">
                                    {item.avgPercentage?.toFixed(0)}<span className="text-sm">%</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                                    AVG Score
                                    </p>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                     <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">View Project &rarr;</a>
                                     {user?.role === "admin" && (
                                        <button 
                                            onClick={() => handleSetRank(item._id, 0)}
                                            className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase border-t pt-2 border-zinc-200"
                                        >
                                            Remove Rank
                                        </button>
                                     )}
                                </div>
                            )}
                        </div>
                        </motion.div>
                    ))}
                    </div>
                )}

                {/* --- TABLE SECTION (THE REST) --- */}
                {tableItems.length > 0 && (
                    <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden"
                    >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                            <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">Rank</th>
                            <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">
                                {activeTab === 'quiz' ? 'Builder' : 'Project Info'}
                            </th>
                            <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">
                                {activeTab === 'quiz' ? 'Performance' : 'Author'}
                            </th>
                            <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">
                                {activeTab === 'quiz' ? 'Quizzes' : 'Status'}
                            </th>
                            {user?.role === "admin" && (
                                <th className="p-5 text-right text-xs font-black uppercase tracking-widest text-zinc-400">Manage</th>
                            )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {tableItems.map((item, index) => (
                            <tr 
                                key={item._id || index} 
                                className="group hover:bg-zinc-50/80 transition-colors"
                            >
                                <td className="p-5">
                                <span className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 font-bold flex items-center justify-center text-sm">
                                    #{index + 4}
                                </span>
                                </td>
                                
                                <td className="p-5">
                                    {activeTab === 'quiz' ? (
                                        /* QUIZ USER COLUMN */
                                        <div className="flex items-center gap-4">
                                            <img 
                                            src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random`} 
                                            className="w-10 h-10 rounded-xl object-cover bg-zinc-200"
                                            alt=""
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900">{item.name || "Unknown"}</span>
                                                    <AlphaBadge className="scale-75 origin-left opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-xs text-zinc-400 font-medium">@{item.username || "builder"}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* PROJECT INFO COLUMN */
                                        <div className="flex items-center gap-4">
                                             <img 
                                                src={item.image || "https://via.placeholder.com/40"} 
                                                className="w-10 h-10 rounded-lg object-cover bg-zinc-200 border border-zinc-100"
                                                alt=""
                                            />
                                            <div>
                                                <span className="font-bold text-zinc-900 block">{item.title}</span>
                                                <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline font-medium">View Live</a>
                                            </div>
                                        </div>
                                    )}
                                </td>

                                <td className="p-5">
                                    {activeTab === 'quiz' ? (
                                        /* QUIZ STATS */
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${item.avgPercentage >= 80 ? 'bg-green-500' : item.avgPercentage >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                                                style={{ width: `${item.avgPercentage}%` }}
                                            ></div>
                                            </div>
                                            <span className="font-bold text-zinc-700">{item.avgPercentage?.toFixed(0)}%</span>
                                        </div>
                                    ) : (
                                        /* PROJECT AUTHOR */
                                        <div className="flex items-center gap-2">
                                            <img src={item.user?.avatar || "https://ui-avatars.com/api/?name=User"} className="w-6 h-6 rounded-full" />
                                            <span className="text-sm font-bold text-zinc-600">{item.user?.name}</span>
                                        </div>
                                    )}
                                </td>

                                <td className="p-5">
                                    {activeTab === 'quiz' ? (
                                         <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
                                            {item.totalQuizzes} Games
                                        </span>
                                    ) : (
                                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                                            Submitted
                                        </span>
                                    )}
                                </td>

                                {user?.role === "admin" && (
                                <td className="p-5 text-right">
                                    {activeTab === 'quiz' ? (
                                        <button
                                            onClick={() => handleRemoveStudent(item._id)}
                                            className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            title="Remove User Data"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleSetRank(item._id, 1)} className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-200 border border-yellow-200 text-xs font-bold" title="Gold">1</button>
                                            <button onClick={() => handleSetRank(item._id, 2)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-200 border border-slate-200 text-xs font-bold" title="Silver">2</button>
                                            <button onClick={() => handleSetRank(item._id, 3)} className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-200 border border-orange-200 text-xs font-bold" title="Bronze">3</button>
                                        </div>
                                    )}
                                </td>
                                )}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </motion.div>
                )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;