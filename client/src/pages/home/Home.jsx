import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateUserAvatarApi, checkInApi } from "../../services/api.user.js";
import Confetti from "react-confetti";
import CountUp from "react-countup";

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

// --- Hooks ---
const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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

  useEffect(() => { setCheckedInToday(isToday(user?.lastCheckIn)); }, [user?.lastCheckIn]);
  useEffect(() => { if (showConfetti) { const timer = setTimeout(() => setShowConfetti(false), 5000); return () => clearTimeout(timer); } }, [showConfetti]);

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
    <div className="relative w-full bg-gradient-to-r from-orange-400 to-yellow-300 rounded-xl p-3 flex items-center justify-between text-black shadow-md mb-4 overflow-hidden">
      {showConfetti && typeof window !== "undefined" && width > 0 && height > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Streak</span>
        <span key={key} className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">{user?.studyStreak || 0} DAYS 🔥</span>
      </div>
      <button onClick={handleCheckIn} disabled={checkedInToday} className={`px-3 py-1 rounded-md font-semibold transition-all text-sm ${checkedInToday ? "bg-white/30 text-black/50 cursor-not-allowed" : "bg-white text-black hover:bg-white/80"}`}>
        {checkedInToday ? "Checked In" : "Check In"}
      </button>
    </div>
  );
};

// --- Clock Component ---
const Clock = () => {
  const [date, setDate] = useState(new Date());
  const [is24HourFormat, setIs24HourFormat] = useState(false);

  useEffect(() => { const timer = setInterval(() => setDate(new Date()), 1000); return () => clearInterval(timer); }, []);

  const formatTime = (date, is24Hour) => {
    if (is24Hour) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h12" }).replace(" ", "");
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
          <button onClick={() => setIs24HourFormat(false)} className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!is24HourFormat ? "bg-white text-gray-800" : "text-gray-400 hover:text-white"}`}>12H</button>
          <button onClick={() => setIs24HourFormat(true)} className={`text-xs px-2 py-0.5 rounded-full transition-colors ${is24HourFormat ? "bg-white text-gray-800" : "text-gray-400 hover:text-white"}`}>24H</button>
        </div>
      </div>
    </div>
  );
};

// --- LearningGoals Component ---
const LearningGoals = () => {
  const [goals, setGoals] = useState(() => { const saved = localStorage.getItem("learningGoals"); return saved ? JSON.parse(saved) : [{ id: 1, text: "Add your first goal!", completed: false }]; });
  const [input, setInput] = useState("");
  useEffect(() => localStorage.setItem("learningGoals", JSON.stringify(goals)), [goals]);

  const handleAddGoal = (e) => { e.preventDefault(); if (!input.trim()) return; setGoals([...goals, { id: Date.now(), text: input, completed: false }]); setInput(""); };
  const toggleGoal = (id) => setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const handleDeleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 mb-3">
        {goals.length === 0 ? <p className="text-sm text-gray-400">No goals yet. Add one!</p> : goals.map(goal => (
          <div key={goal.id} className={`p-2 rounded-lg flex items-center justify-between transition-all text-sm ${goal.completed ? "bg-green-900/50 text-gray-400" : "bg-zinc-800 hover:bg-zinc-700"}`}>
            <div onClick={() => toggleGoal(goal.id)} className="flex items-center cursor-pointer flex-grow mr-2">
              <input type="checkbox" readOnly checked={goal.completed} className="mr-2 w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded pointer-events-none" />
              <span className={goal.completed ? "line-through" : ""}>{goal.text}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="flex-shrink-0"><TrashIcon /></button>
          </div>
        ))}
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
  const [resources, setResources] = useState(() => { const saved = localStorage.getItem("resourceHub"); return saved ? JSON.parse(saved) : [{ id: 1, title: "React Docs (New)", url: "https://react.dev", category: "Documentation" }]; });
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
                <span>{res.title}</span>
              </a>
              <button onClick={() => handleDeleteResource(res.id)}><TrashIcon /></button>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleAddResource} className="bg-zinc-900 p-6 rounded-xl flex flex-col gap-3 w-80">
            <h2 className="text-lg font-semibold">Add Resource</h2>
            <input type="text" placeholder="Title" value={newResource.title} onChange={e => setNewResource(prev => ({ ...prev, title: e.target.value }))} className="rounded-lg p-2 bg-zinc-800 text-white text-sm" required />
            <input type="url" placeholder="URL" value={newResource.url} onChange={e => setNewResource(prev => ({ ...prev, url: e.target.value }))} className="rounded-lg p-2 bg-zinc-800 text-white text-sm" required />
            <input type="text" placeholder="Category" value={newResource.category} onChange={e => setNewResource(prev => ({ ...prev, category: e.target.value }))} className="rounded-lg p-2 bg-zinc-800 text-white text-sm" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
              <button type="submit" className="bg-indigo-500 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- ProfileCard Component ---
const ProfileCard = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChangeAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const toastId = toast.loading("Uploading avatar...");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await updateUserAvatarApi(formData);
      setUser(prev => ({ ...prev, avatar: data.avatar }));
      toast.success("Avatar updated!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center text-white shadow-md mb-6">
      <div className="relative">
        <img src={user?.avatar || "/default-avatar.png"} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500" />
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChangeAvatar} />
        <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-indigo-500 p-1 rounded-full hover:bg-indigo-600 transition-colors text-xs">{isUploading ? "..." : "Edit"}</button>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{user?.name || "Student Name"}</h2>
      <p className="text-gray-400 text-sm">{user?.email}</p>
    </div>
  );
};

// --- Home Component ---
const Home = () => {
  return (
    <div className="p-4 lg:p-8 bg-zinc-950 min-h-screen text-white">
      <ProfileCard />
      <Clock />
      <StudyStreak />
      <div className="grid lg:grid-cols-2 gap-6">
        <LearningGoals />
        <ResourceHub />
      </div>
    </div>
  );
};

export default Home;
