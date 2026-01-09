import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaCrown, FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";
import AlphaBadge from "../../components/AlphaBadge"; // ✅ Added Badge

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      setLeaders(data || []);
    } catch (err) {
      toast.error(err.message || "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [API_URL]);

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student's data?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/leaderboard/user/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to remove student data");
      toast.success("Student's leaderboard data removed!");
      fetchLeaderboard();
    } catch (err) {
      toast.error(err.message || "Error removing student data");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-[60vh] text-zinc-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Summoning Champions...</p>
      </div>
    );
  }

  if (!leaders.length) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full p-4">
        <div className="text-center bg-zinc-50 p-10 rounded-[2rem] border border-zinc-200">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🏆
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">The Arena is Empty</h2>
          <p className="text-zinc-500 font-medium">Be the first to take a quiz and claim the top spot!</p>
        </div>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const theRest = leaders.slice(3);

  // Helper for Podium Styles
  const getPodiumStyle = (index) => {
    switch (index) {
      case 0: // 🥇 GOLD
        return "order-1 sm:order-2 z-20 scale-105 sm:scale-110 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-gradient-to-b from-yellow-50 to-white";
      case 1: // 🥈 SILVER
        return "order-2 sm:order-1 border-slate-300 shadow-xl bg-white mt-4 sm:mt-0";
      case 2: // 🥉 BRONZE
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
        <header className="text-center mb-16 pt-8">
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-500 font-medium text-lg max-w-lg mx-auto"
          >
            Top builders and learners who are crushing the quizzes.
          </motion.p>
        </header>

        {/* --- PODIUM SECTION (TOP 3) --- */}
        <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-6 mb-16">
          {topThree.map((leader, index) => (
            <motion.div
              key={leader._id || index}
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

              {/* Avatar */}
              <div className="relative mb-4">
                <img 
                  src={leader.avatar || `https://ui-avatars.com/api/?name=${leader.name}&background=random`} 
                  alt={leader.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-zinc-100"
                />
                {index === 0 && <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce">🔥</div>}
              </div>

              {/* User Info */}
              <h3 className="text-lg font-bold text-zinc-900 truncate w-full px-2">
                {leader.name || "Unknown"}
              </h3>
              <p className="text-xs text-zinc-400 font-bold mb-2">@{leader.username || "builder"}</p>
              
              <div className="flex items-center gap-2 mb-4">
                 <AlphaBadge />
              </div>

              {/* Stats */}
              <div className="w-full bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-3xl font-black text-indigo-600 leading-none">
                  {leader.avgPercentage?.toFixed(0)}<span className="text-sm">%</span>
                </p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                  AVG Score
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- TABLE SECTION (THE REST) --- */}
        {theRest.length > 0 && (
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
                    <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">Builder</th>
                    <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">Performance</th>
                    <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-zinc-400">Quizzes</th>
                    {user?.role === "admin" && (
                      <th className="p-5 text-right text-xs font-black uppercase tracking-widest text-zinc-400">Manage</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {theRest.map((leader, index) => (
                    <tr 
                      key={leader._id || index} 
                      className="group hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="p-5">
                        <span className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 font-bold flex items-center justify-center text-sm">
                          #{index + 4}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={leader.avatar || `https://ui-avatars.com/api/?name=${leader.name}&background=random`} 
                            className="w-10 h-10 rounded-xl object-cover bg-zinc-200"
                            alt=""
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900">{leader.name || "Unknown"}</span>
                              <AlphaBadge className="scale-75 origin-left opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-xs text-zinc-400 font-medium">@{leader.username || "builder"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${leader.avgPercentage >= 80 ? 'bg-green-500' : leader.avgPercentage >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                              style={{ width: `${leader.avgPercentage}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-zinc-700">{leader.avgPercentage?.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
                          {leader.totalQuizzes} Games
                        </span>
                      </td>
                      {user?.role === "admin" && (
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleRemoveStudent(leader._id)}
                            className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove User Data"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;