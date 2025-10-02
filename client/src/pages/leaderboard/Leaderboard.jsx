import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
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
      const res = await fetch(`${API_URL}/api/leaderboard/user/${studentId}`, {
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
      <div className="flex justify-center items-center w-full h-full text-gray-600">
        <p className="text-xl animate-pulse">Summoning the Champions...</p>
      </div>
    );
  }

  if (!leaders.length) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full p-4">
        <div className="text-center bg-gray-50 p-8 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">The Arena is Empty</h2>
          <p className="text-gray-500">Be the first to take a quiz and claim the top spot!</p>
        </div>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const theRest = leaders.slice(3);

  const getPodiumClass = (index) => {
    switch (index) {
      case 0:
        return "border-amber-400 order-1 sm:order-2 transform sm:scale-110 z-10";
      case 1:
        return "border-slate-400 order-2 sm:order-1";
      case 2:
        return "border-amber-600 order-3 sm:order-3";
      default:
        return "";
    }
  };

  const getMedal = (index) => {
    if (index === 0) return <FaCrown className="text-amber-400" />;
    if (index === 1) return <span className="text-slate-500 font-bold">2nd</span>;
    if (index === 2) return <span className="text-amber-700 font-bold">3rd</span>;
    return null;
  };

  return (
    <motion.div
      className="w-full h-full font-sans text-gray-800"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.1 }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Hall of Fame
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500"
          >
            Our top-performing champions!
          </motion.p>
        </header>

        <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-8 mb-12">
          {topThree.map((leader, index) => (
            <motion.div
              key={leader._id?._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white p-6 rounded-xl shadow-lg w-full sm:w-1/4 text-center border-t-4 transition-transform duration-300 hover:scale-105 ${getPodiumClass(index)}`}
            >
              <div className="text-3xl mb-3 flex items-center justify-center gap-2 font-bold">
                {getMedal(index)}
              </div>
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 border-2 border-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                {leader._id?.name.charAt(0).toUpperCase() || "U"}
              </div>
              <h3 className="text-xl font-semibold truncate">{leader._id?.name || "Unknown"}</h3>
              <p className="text-2xl font-bold text-indigo-600">{leader.avgPercentage?.toFixed(2) || 0}%</p>
              <p className="text-sm text-gray-500">{leader.totalQuizzes || 0} Quizzes</p>
            </motion.div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Rank</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Student</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Avg %</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Quizzes</th>
                {user?.role === "admin" && (
                  <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {theRest.map((leader, index) => (
                <motion.tr
                  key={leader._id?._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="border-t border-gray-200 hover:bg-gray-50/70 transition-colors duration-200"
                >
                  <td className="p-4 font-medium text-gray-600">{index + 4}</td>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                      {leader._id?.name.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="truncate">{leader._id?.name || "Unknown"}</span>
                  </td>
                  <td className="p-4 text-green-600 font-semibold">{leader.avgPercentage?.toFixed(2) || 0}%</td>
                  <td className="p-4 text-gray-500">{leader.totalQuizzes || 0}</td>
                  {user?.role === "admin" && (
                    <td className="p-4">
                      <button
                        onClick={() => handleRemoveStudent(leader._id?._id)}
                        className="p-2 text-gray-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        aria-label="Remove student"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
