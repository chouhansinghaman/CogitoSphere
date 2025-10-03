import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateUserAvatarApi, checkInApi } from "../../services/api.user.js";
import Confetti from 'react-confetti';
import CountUp from 'react-countup';

// --- Icons ---
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

// Small client-safe confetti hook: only render if window exists
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

// --- StudyStreak Component ---
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
      setUser(prevUser => ({
        ...prevUser,
        studyStreak: data.studyStreak,
        lastCheckIn: data.lastCheckIn
      }));
      setCheckedInToday(true);
      setShowConfetti(true);
      setKey(prevKey => prevKey + 1);
      toast.success("Study session logged! Keep it up!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed.", { id: toastId });
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-400 to-yellow-300 rounded-xl p-3 flex items-center justify-between text-black shadow-md mb-4 overflow-hidden">
      {showConfetti && typeof window !== 'undefined' && width > 0 && height > 0 && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
      )}
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Streak</span>
        <span key={key} className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
          {user?.studyStreak || 0} DAYS 🔥
        </span>
      </div>
      <button
        onClick={handleCheckIn}
        disabled={checkedInToday}
        className={`px-3 py-1 rounded-md font-semibold transition-all text-sm ${
          checkedInToday ? "bg-white/30 text-black/50 cursor-not-allowed" : "bg-white text-black hover:bg-white/80"
        }`}
      >
        {checkedInToday ? "Checked In" : "Check In"}
      </button>
    </div>
  );
};

// --- Clock Component ---
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
    <div className="w-full h-40 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl mb-6 flex flex-col items-center justify-center p-4 text-white relative shadow-lg hover:shadow-xl transition-all">
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl lg:text-7xl font-mono flex items-baseline leading-none">
          <span className="text-orange-500 font-black">{hour}:</span>
          <span className="text-gray-100 font-black">{minute}</span>
          {ampm && <span className="text-sm font-semibold ml-1 self-end">{ampm}</span>}
        </div>
        <p className="text-gray-400 text-xs mt-3 mb-2">Select your clock style</p>
        <div className="flex bg-gray-700 rounded-full p-0.5">
          <button
            onClick={() => setIs24HourFormat(false)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!is24HourFormat ? "bg-white text-gray-800" : "text-gray-400 hover:text-white"}`}
          >
            12H
          </button>
          <button
            onClick={() => setIs24HourFormat(true)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${is24HourFormat ? "bg-white text-gray-800" : "text-gray-400 hover:text-white"}`}
          >
            24H
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LearningGoals Component ---
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
      <div className="flex flex-col gap-2 mb-3">
        {goals.length === 0 ? <p className="text-sm text-gray-400">No goals yet. Add one!</p> :
          goals.map(goal => (
            <div key={goal.id} className={`p-2 rounded-lg flex items-center justify-between transition-all text-sm ${goal.completed ? "bg-green-900/50 text-gray-400" : "bg-zinc-800 hover:bg-zinc-700"}`}>
              <div onClick={() => toggleGoal(goal.id)} className="flex items-center cursor-pointer flex-grow mr-2">
                <input type="checkbox" readOnly checked={goal.completed} className="mr-2 w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded pointer-events-none" />
                <span className={goal.completed ? "line-through" : ""}>{goal.text}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="flex-shrink-0"><TrashIcon /></button>
            </div>
          ))
        }
      </div>
      <form onSubmit={handleAddGoal} className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a new goal..." className="flex-grow bg-zinc-700 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="bg-indigo-500 text-white font-semibold px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-sm">Add</button>
      </form>
    </div>
  );
};

// --- ResourceHub Component ---
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
        <button onClick={() => setIsModalOpen(true)} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Add New</button>
      </div>
      <div className="flex flex-col gap-2">
        {resources.length === 0 ? <p className="text-sm text-gray-400">No resources yet. Add one!</p> :
          resources.map(res => (
            <div key={res.id} className="bg-zinc-800 p-2 rounded-lg flex items-center justify-between gap-2 hover:bg-zinc-700 transition-colors text-sm">
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-grow">
                <img src={getFavicon(res.url)} alt="" className="w-5 h-5 rounded-md bg-white/10" />
                <div className="truncate">
                  <p className="font-semibold text-white truncate">{res.title}</p>
                  <p className="text-xs text-gray-400">{res.category}</p>
                </div>
              </a>
              <button onClick={() => handleDeleteResource(res.id)} className="flex-shrink-0"><TrashIcon /></button>
            </div>
          ))
        }
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 text-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <h2 className="text-lg font-bold mb-4">Add New Resource</h2>
            <form onSubmit={handleAddResource} className="flex flex-col gap-3">
              <input type="text" placeholder="Resource Title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} className="bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="url" placeholder="Resource URL" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} className="bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Category (optional)" value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} className="bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors font-semibold text-sm">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ProfileHeader Component ---
const ProfileHeader = ({ user }) => {
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => { fileInputRef.current.click(); };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    const toastId = toast.loading("Uploading avatar...");

    try {
      const { data } = await updateUserAvatarApi(formData);
      setUser(prevUser => ({ ...prevUser, avatar: data.avatar }));
      toast.success("Avatar updated!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.", { id: toastId });
    }
  };

  return (
    <div className="flex items-center gap-4 w-full mb-4">
      <div className="relative w-16 h-16 group flex-shrink-0">
        <img src={user?.avatar || "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg"} alt={user?.name || "User"} className="w-full h-full rounded-full object-cover" />
        <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"></path>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="m16 20 2-2-4-4-2 2-4-4"></path>
          </svg>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-lg text-white">{user?.name || "Full Name"}</span>
        <span className="text-sm text-gray-300">@{user?.username || "username"}</span>
      </div>
    </div>
  );
};

// --- ProfileCard Component ---
const ProfileCard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "goals");

  useEffect(() => { localStorage.setItem("activeTab", activeTab); }, [activeTab]);

  return (
    <div className="w-full md:w-[380px] bg-black/90 backdrop-blur-xl text-white rounded-3xl p-6 flex flex-col items-center relative shadow-xl">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <button onClick={() => navigate("/notifications")} className="text-lg">🔔</button>
      </div>

      <ProfileHeader user={user} />
      <StudyStreak />
      <Clock />

      <button onClick={() => navigate("/leaderboard")} className="w-full px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 mb-4">
        🏆 Leaderboard
      </button>

      <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mt-2">
        <div className="flex border-b border-zinc-700 mb-4">
          <button onClick={() => setActiveTab("goals")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === "goals" ? "text-white border-b-2 border-indigo-500" : "text-gray-400 hover:text-white"}`}>
            Learning Goals
          </button>
          <button onClick={() => setActiveTab("resources")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === "resources" ? "text-white border-b-2 border-indigo-500" : "text-gray-400 hover:text-white"}`}>
            Resource Hub
          </button>
        </div>
        <div className="w-full">{activeTab === "goals" ? <LearningGoals /> : <ResourceHub />}</div>
      </div>
    </div>
  );
};

// --- PerformanceSnapshot Component ---
const PerformanceSnapshot = ({ submissions, isLoading }) => {
  const stats = useMemo(() => {
    if (!submissions || submissions.length === 0) return { quizzesTaken: 0, averageScore: 0, highestScore: 0 };
    const totalPercentage = submissions.reduce((sum, s) => sum + s.percentage, 0);
    const highest = Math.max(...submissions.map(s => s.percentage));
    return { quizzesTaken: submissions.length, averageScore: Math.round(totalPercentage / submissions.length), highestScore: Math.round(highest) };
  }, [submissions]);

  if (isLoading) {
    // Simple tailwind skeletons (no external Skeleton component)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const statItems = [
    { icon: <IconClipboardList />, label: "Quizzes Taken", value: stats.quizzesTaken, unit: "" },
    { icon: <IconTarget />, label: "Average Score", value: stats.averageScore, unit: "%" },
    { icon: <IconAward />, label: "Highest Score", value: stats.highestScore, unit: "%" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {statItems.map(item => (
        <div key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-gray-50 p-3 rounded-full">{item.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold"><CountUp end={item.value} duration={2} separator="," />{item.unit}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- RecentPerformance Component ---
const RecentPerformance = ({ submissions, isLoading }) => {
  const navigate = useNavigate();
  const getScoreColor = (percentage) => percentage >= 80 ? "text-green-500" : percentage >= 50 ? "text-amber-500" : "text-red-500";

  if (isLoading) return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse" />
      <div className="h-16 w-full bg-gray-200 rounded-md animate-pulse" />
      <div className="h-16 w-full bg-gray-200 rounded-md animate-pulse" />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-xl mb-4">Recent Performance</h3>
      {(!submissions || submissions.length === 0) ? (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">No quiz submissions yet. Ready to test your knowledge?</p>
          <button onClick={() => navigate('/quizzes')} className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">Go to Quizzes</button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
          {submissions.map(sub => (
            <div key={sub._id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{sub.quiz?.title || "Quiz"}</p>
                <p className="text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="w-1/3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className={`font-bold text-lg ${getScoreColor(sub.percentage)}`}>{Math.round(sub.percentage)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className={`${sub.percentage >= 80 ? 'bg-green-500' : sub.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'} h-1.5 rounded-full`} style={{ width: `${sub.percentage}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- ExploreCourses Component ---
const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );

  useEffect(() => {
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const url = API_URL.endsWith("/api") ? `${API_URL}/courses` : `${API_URL}/api/courses`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Could not fetch courses");
      }
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (error) {
      toast.error(error.message);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };
  fetchCourses();
}, [API_URL]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="h-6 w-1/3 mb-4 bg-gray-200 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-xl mb-4">Explore Courses</h3>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map(course => (
            <div key={course._id} onClick={() => navigate(`/courses/${course._id}`, { state: { course } })} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-indigo-400 hover:-translate-y-1">
              <div className="flex flex-col flex-grow">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold self-start px-3 py-1 rounded-full">{course.category}</span>
                <h4 className="font-bold text-lg text-gray-900 mt-3">{course.title}</h4>
                <p className="text-gray-600 text-sm mt-2 flex-grow line-clamp-3">{course.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-indigo-600">
                <span className="font-semibold text-sm mr-2 group-hover:underline">Start Learning</span>
                <ArrowRightIcon />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No courses available at the moment. Check back later!</p>
      )}
    </div>
  );
};

// --- Home Component ---
const Home = () => {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/submissions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Could not fetch submissions');
        setSubmissions(data.submissions || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [token, API_URL]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 font-sans">
      <div className="flex-1 flex flex-col">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-black mb-2 leading-tight tracking-tight">
          Invest in your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            education
          </span>
        </h1>

        <div className="mt-5 space-y-6">
          <PerformanceSnapshot submissions={submissions} isLoading={isLoading} />
          <RecentPerformance submissions={submissions} isLoading={isLoading} />
          <ExploreCourses />
        </div>
      </div>
      <ProfileCard user={user} />
    </div>
  );
};

export default Home;
