import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateUserAvatarApi, checkInApi } from "../../services/api.user.js";
import Confetti from 'react-confetti';
import CountUp from 'react-countup';
import { motion } from "framer-motion";
import {
  FiPlus, FiCode, FiCheckCircle, FiEdit, FiArrowRight,
  FiZap, FiBookOpen, FiSun, FiMoon
} from 'react-icons/fi';
import AlphaBadge from "../../components/AlphaBadge";

// --- CUSTOM HOOKS ---
const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
};

const useSubmissions = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/submissions/my`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch submissions");
        const data = await res.json();
        setSubmissions(data.submissions || data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSubmissions();
  }, [token]);

  return { submissions, loading };
};

// --- ICONS ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500 transition-colors">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const IconClipboardList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);
const IconTarget = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);
const IconAward = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline>
  </svg>
);

// --- NEW COMPONENT: Dynamic Greeting ---
const WelcomeSection = ({ user }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">
        {hour < 18 ? <FiSun className="text-orange-500" /> : <FiMoon className="text-indigo-400" />}
        {greeting}, {user?.name?.split(" ")[0]}
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black leading-[0.9] tracking-tighter">
        Ready to <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r pr-2 from-indigo-600 via-purple-600 to-pink-600">
          ship something?
        </span>
      </h1>
    </motion.div>
  );
};

// --- NEW COMPONENT: Quick Actions ---
const QuickActions = () => {
  const navigate = useNavigate();
  const actions = [
    { label: "Take Quiz", icon: <FiZap />, path: "/quizzes", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { label: "Explore Project", icon: <FiCode />, path: "/community", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
    { label: "My Courses", icon: <FiBookOpen />, path: "/courses", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(action.path)}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-colors ${action.color} border border-transparent cursor-pointer`}
        >
          <div className="text-2xl mb-2">{action.icon}</div>
          <span className="text-xs font-bold uppercase tracking-wide">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// --- COMPONENT: Build Hub Status ---
const BuildHubStatus = ({ user }) => {
  const navigate = useNavigate();
  const isAvailable = user?.builderProfile?.lookingForTeam;

  return (
    <div className="relative overflow-hidden bg-zinc-900 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between mb-8 border border-zinc-800 transition-all hover:border-indigo-500/50 group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center gap-4 mb-4 sm:mb-0 relative z-10">
        <div className={`p-4 rounded-2xl ${isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
          {isAvailable ? <FiCheckCircle size={28} /> : <FiCode size={28} />}
        </div>
        <div>
          <h4 className="text-xl font-bold tracking-tight">
            {isAvailable ? "You are in the Pool" : "Ready to Build?"}
          </h4>
          <p className="text-sm text-zinc-400 mt-0.5">
            {isAvailable
              ? "The matching engine is currently finding teams for you."
              : "Sync your builder profile to start collaborating on projects."}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate(isAvailable ? "/community" : "/settings")}
        className="relative z-10 w-full sm:w-auto bg-white text-black px-8 py-3 rounded-2xl font-black text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/20"
      >
        {isAvailable ? "BROWSE HUB" : "SYNC PROFILE"}
      </button>
    </div>
  );
};

// --- COMPONENT: Study Streak ---
const StudyStreak = () => {
  const { user, setUser } = useAuth();
  const [key, setKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const isToday = (someDate) => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  };

  const [checkedInToday, setCheckedInToday] = useState(isToday(user?.lastCheckIn));

  useEffect(() => {
    setCheckedInToday(isToday(user?.lastCheckIn));
  }, [user?.lastCheckIn]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleCheckIn = async () => {
    if (checkedInToday) return;
    const toastId = toast.loading("Checking in...");
    try {
      const { data } = await checkInApi();
      setUser(prev => ({ ...prev, studyStreak: data.studyStreak, lastCheckIn: data.lastCheckIn }));
      setCheckedInToday(true);
      setShowConfetti(true);
      setKey(prev => prev + 1);
      toast.success("Study session logged! Keep it up!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed.", { id: toastId });
    }
  };

  return (
    <div className="relative w-full bg-zinc-800/50 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg mb-6 overflow-hidden backdrop-blur-sm">
      {showConfetti && width > 0 && height > 0 && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
      )}
      <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 pointer-events-none"></div>

      <div className="flex flex-col relative z-10">
        <span className="text-xs uppercase font-bold text-orange-400 tracking-wider mb-1">Current Streak</span>
        <span key={key} className="text-3xl font-black text-white animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2">
          {user?.studyStreak || 0} <span className="text-lg text-gray-400 font-medium">DAYS</span> 🔥
        </span>
      </div>
      <button
        onClick={handleCheckIn}
        disabled={checkedInToday}
        className={`relative z-10 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${checkedInToday
          ? "bg-zinc-700/50 border-zinc-600 text-zinc-400 cursor-not-allowed"
          : "bg-orange-500 text-black border-orange-400 hover:bg-orange-400 hover:scale-105"
          }`}
      >
        {checkedInToday ? "Checked In" : "Check In"}
      </button>
    </div>
  );
};

// --- COMPONENT: Clock ---
const Clock = () => {
  const [date, setDate] = useState(new Date());
  const [is24HourFormat, setIs24HourFormat] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date, is24Hour) => {
    if (is24Hour) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    } else {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h12" }).replace(" ", "");
    }
  };

  const timeString = formatTime(date, is24HourFormat);
  const hour = timeString.split(":")[0];
  const minute = timeString.split(":")[1].substring(0, 2);
  const ampm = !is24HourFormat ? timeString.substring(timeString.length - 2).toLowerCase() : "";

  return (
    <div className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-6 flex flex-col items-center justify-center p-4 text-white relative shadow-inner">
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-5xl font-mono flex items-baseline leading-none">
          <span className="text-indigo-400 font-black">{hour}:</span>
          <span className="text-gray-100 font-black">{minute}</span>
          {ampm && <span className="text-sm font-semibold ml-1 self-end text-gray-500">{ampm}</span>}
        </div>
        <div className="flex bg-zinc-800 rounded-full p-0.5 mt-2 scale-90">
          <button onClick={() => setIs24HourFormat(false)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${!is24HourFormat ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}>12H</button>
          <button onClick={() => setIs24HourFormat(true)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${is24HourFormat ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}>24H</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Learning Goals ---
const LearningGoals = () => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("learningGoals");
    return saved ? JSON.parse(saved) : [{ id: 1, text: "Add your first goal!", completed: false }];
  });
  const [input, setInput] = useState("");
  useEffect(() => localStorage.setItem("learningGoals", JSON.stringify(goals)), [goals]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setGoals([...goals, { id: Date.now(), text: input, completed: false }]);
    setInput("");
  };

  const toggleGoal = (id) => setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const handleDeleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 mb-3 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {goals.length === 0 ? <p className="text-sm text-gray-500 italic p-2">No goals yet. Add one!</p> :
          goals.map(goal => (
            <div key={goal.id} className={`p-2 rounded-lg flex items-center justify-between transition-all text-sm group ${goal.completed ? "bg-green-900/20 text-gray-500" : "bg-zinc-800/50 hover:bg-zinc-800 text-gray-200"}`}>
              <div onClick={() => toggleGoal(goal.id)} className="flex items-center cursor-pointer flex-grow mr-2">
                <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${goal.completed ? "bg-green-500 border-green-500" : "border-zinc-600 group-hover:border-indigo-500"}`}>
                  {goal.completed && <FiCheckCircle size={10} className="text-white" />}
                </div>
                <span className={goal.completed ? "line-through" : ""}>{goal.text}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
            </div>
          ))
        }
      </div>
      <form onSubmit={handleAddGoal} className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="New goal..." className="flex-grow bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 transition-colors"><FiPlus /></button>
      </form>
    </div>
  );
};

// --- COMPONENT: Resource Hub ---
const ResourceHub = () => {
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("resourceHub");
    return saved ? JSON.parse(saved) : [{ id: 1, title: "React Docs (New)", url: "https://react.dev", category: "Documentation" }];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", url: "", category: "" });
  useEffect(() => localStorage.setItem("resourceHub", JSON.stringify(resources)), [resources]);
  useEffect(() => { document.body.style.overflow = isModalOpen ? "hidden" : "auto"; }, [isModalOpen]);

  const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
  const handleDeleteResource = (id) => setResources(resources.filter(r => r.id !== id));

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    setResources([...resources, { id: Date.now(), title: newResource.title.trim(), url: newResource.url.trim(), category: newResource.category.trim() || "General" }]);
    setNewResource({ title: "", url: "", category: "" });
    setIsModalOpen(false);
    toast.success("Resource added!");
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-end mb-2">
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1"><FiPlus /> Add New</button>
      </div>
      <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {resources.length === 0 ? <p className="text-sm text-gray-500 italic">No resources yet.</p> :
          resources.map(res => (
            <div key={res.id} className="bg-zinc-800/50 p-2 rounded-lg flex items-center justify-between gap-2 hover:bg-zinc-800 transition-colors text-sm group border border-transparent hover:border-zinc-700">
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-grow overflow-hidden">
                <img src={getFavicon(res.url)} alt="" className="w-6 h-6 rounded bg-white/10 p-0.5" />
                <div className="truncate">
                  <p className="font-semibold text-gray-200 truncate">{res.title}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{res.category}</p>
                </div>
              </a>
              <button onClick={() => handleDeleteResource(res.id)} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
            </div>
          ))
        }
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
            <h2 className="text-lg font-bold mb-4">Add Link</h2>
            <form onSubmit={handleAddResource} className="flex flex-col gap-3">
              <input type="text" placeholder="Title (e.g. React Docs)" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} className="bg-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="url" placeholder="URL (https://...)" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} className="bg-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Category (optional)" value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} className="bg-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-sm font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors font-bold text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: Profile Header ---
const ProfileHeader = ({ user }) => {
  return (
    <div className="flex items-center gap-4 w-full mb-6">
      <div className="relative w-16 h-16 group flex-shrink-0">
        <img src={user?.avatar || "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg"} alt={user?.name || "User"} className="w-full h-full rounded-full object-cover border-2 border-zinc-700 group-hover:border-indigo-500 transition-colors" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-white leading-tight">{user?.name || "Full Name"}</span>
        <div className="mt-1"><AlphaBadge /></div>
        <span className="text-sm text-gray-400 font-medium mt-1">@{user?.username || "username"}</span>
      </div>
    </div>
  );
};

// --- COMPONENT: Profile Card ---
const ProfileCard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "goals");
  if (!user) return null;
  React.useEffect(() => { localStorage.setItem("activeTab", activeTab); }, [activeTab]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (e) { console.error(e); }
    };
    checkNotifications();
  }, []);

  return (
    <div className="w-full lg:w-[380px] bg-black/95 backdrop-blur-2xl text-white rounded-[2rem] p-6 flex flex-col items-center relative shadow-2xl border border-zinc-800">
      <div className="absolute top-8 right-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/notifications")}
          className="relative text-xl text-gray-400 hover:text-white transition-colors"
        >
          <span className={unreadCount > 0 ? "animate-swing inline-block origin-top" : ""}>
            🔔
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      <ProfileHeader user={user} />
      <StudyStreak />
      <Clock />
      <button onClick={() => navigate("/leaderboard")} className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 mb-6 shadow-lg shadow-yellow-500/20">
        🏆 Leaderboard
      </button>
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <div className="flex border-b border-zinc-800 mb-4 pb-2">
          <button onClick={() => setActiveTab("goals")} className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative ${activeTab === "goals" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            Goals
            {activeTab === "goals" && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-indigo-500 rounded-full"></span>}
          </button>
          <button onClick={() => setActiveTab("resources")} className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative ${activeTab === "resources" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            Resources
            {activeTab === "resources" && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-indigo-500 rounded-full"></span>}
          </button>
        </div>
        <div className="w-full">{activeTab === "goals" ? <LearningGoals /> : <ResourceHub />}</div>
      </div>
    </div>
  );
};

// --- COMPONENT: Performance Snapshot ---
const PerformanceSnapshot = ({ submissions, isLoading }) => {
  const stats = useMemo(() => {
    if (!submissions || submissions.length === 0) return { quizzesTaken: 0, averageScore: 0, highestScore: 0 };
    const totalPercentage = submissions.reduce((sum, s) => sum + s.percentage, 0);
    const highest = Math.max(...submissions.map(s => s.percentage));
    return { quizzesTaken: submissions.length, averageScore: Math.round(totalPercentage / submissions.length), highestScore: Math.round(highest) };
  }, [submissions]);

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-3 gap-6"><div className="h-24 bg-gray-200 rounded-2xl animate-pulse" /><div className="h-24 bg-gray-200 rounded-2xl animate-pulse" /><div className="h-24 bg-gray-200 rounded-2xl animate-pulse" /></div>;

  const statItems = [
    { icon: <IconClipboardList />, label: "Quizzes Taken", value: stats.quizzesTaken, unit: "" },
    { icon: <IconTarget />, label: "Average Score", value: stats.averageScore, unit: "%" },
    { icon: <IconAward />, label: "Highest Score", value: stats.highestScore, unit: "%" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
        >
          <div className="bg-gray-50 p-4 rounded-2xl">{item.icon}</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1"><CountUp end={item.value} duration={2} separator="," />{item.unit}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- COMPONENT: Recent Performance ---
const RecentPerformance = ({ submissions, isLoading }) => {
  const navigate = useNavigate();
  const getScoreColor = (percentage) => percentage >= 80 ? "text-green-500" : percentage >= 50 ? "text-amber-500" : "text-red-500";

  if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"><div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse" /><div className="h-16 w-full bg-gray-200 rounded-md animate-pulse" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl">Recent Performance</h3>
        <button onClick={() => navigate('/quizzes')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide">View All</button>
      </div>

      {(!submissions || submissions.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No quiz submissions yet.</p>
          <button onClick={() => navigate('/quizzes')} className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors">Take a Quiz</button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {submissions.map((sub, idx) => (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div>
                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{sub.quiz?.title || "Quiz"}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{new Date(sub.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="w-1/3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className={`font-black text-xl ${getScoreColor(sub.percentage)}`}>{Math.round(sub.percentage)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className={`${sub.percentage >= 80 ? 'bg-green-500' : sub.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'} h-1.5 rounded-full`} style={{ width: `${sub.percentage}%` }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- COMPONENT: Explore Courses ---
const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const url = `${API_URL}/courses`;
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Could not fetch courses");
        setCourses(Array.isArray(data) ? data : data.courses || []);
      } catch (error) {
        toast.error(error.message || "Failed to fetch courses");
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [API_URL]);

  if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl">Explore Courses</h3>
        <button onClick={() => navigate('/courses')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide">See All</button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.slice(0, 4).map((course, idx) => (
            <div key={course._id} onClick={() => navigate(`/courses/${course._id}`, { state: { course } })} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1">
              <div className="flex flex-col flex-grow">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest self-start px-3 py-1.5 rounded-lg mb-3">{course.category || "General"}</span>
                <h4 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title || "Untitled Course"}</h4>
                <p className="text-gray-500 text-sm mt-3 flex-grow line-clamp-2 leading-relaxed">{course.description || "No description available."}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">View Details</span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FiArrowRight />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No courses available at the moment.</p>
      )}
    </motion.div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const { user, token } = useAuth();
  const { submissions, loading } = useSubmissions();

  if (!user || !token) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  return (
    <div className="relative w-full flex flex-col lg:flex-row gap-8 lg:gap-12 font-sans p-2 sm:p-4">

      {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
      <div className="flex-1 flex flex-col z-10">

        {/* 1. Dynamic Greeting */}
        <WelcomeSection user={user} />

        {/* 2. Quick Actions Row */}
        <QuickActions />

        <div className="space-y-8">
          {/* 3. Build Hub Status */}
          <BuildHubStatus user={user} />

          {/* 4. Stats Grid */}
          <PerformanceSnapshot submissions={submissions} isLoading={loading} />

          {/* 5. Recent Performance */}
          <RecentPerformance submissions={submissions} isLoading={loading} />

          {/* 6. Courses */}
          <ExploreCourses />
        </div>
      </div>

      {/* --- RIGHT COLUMN (SIDEBAR) --- */}
      <div className="lg:sticky lg:top-8 h-fit z-10">
        <ProfileCard user={user} />
      </div>
    </div>
  );
};

export default Home;