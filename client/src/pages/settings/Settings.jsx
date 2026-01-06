import React, { useState } from "react";
import { FiEdit2, FiCode, FiUser, FiLock, FiShieldOff, FiChevronRight, FiMail, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ADMIN_SECRET_CODE = "bethe@dmin2028";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const avatarOptions = [
  "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg",
  "https://i.pinimg.com/474x/0a/5f/ca/0a5fca949be9e2f9951f860398fd7c9f.jpg",
  "https://img.freepik.com/free-photo/aesthetic-anime-character-gaming_23-2151560679.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/free-photo/lifestyle-scene-with-people-doing-regular-tasks-anime-style_23-2151002566.jpg",
  "https://img.freepik.com/free-photo/lifestyle-scene-with-people-doing-regular-tasks-anime-style_23-2151002534.jpg?semt=ais_hybrid&w=740&q=80",
  "https://media.craiyon.com/2025-07-22/BVWL-jyLSpey53Hp-YX0UA.webp",
];

// --- UI COMPONENTS ---
const SectionWrapper = ({ title, children, action = null }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      {...props} 
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:bg-white transition-all disabled:opacity-60"
    />
  </div>
);

const PasswordInput = ({ id, name, value, onChange, placeholder, showState, show, setShow }) => (
  <div className="relative w-full group">
    <InputField 
      id={id}
      name={name}
      label={placeholder}
      type={show[showState] ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={() => setShow((prev) => ({ ...prev, [showState]: !prev[showState] }))}
      className="absolute right-4 top-9 text-gray-400 hover:text-black transition-colors"
    >
      {show[showState] ? "🙈" : "👁️"}
    </button>
  </div>
);

// --- SECTIONS ---

const ProfileSection = () => {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleUpdate = async (payload) => {
    const tid = toast.loading("Updating profile...");
    try {
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setUser(data.user || { ...user, ...payload });
      toast.success("Profile saved!", { id: tid });
      setEditing(false);
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <>
      <SectionWrapper title="Personal Information">
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-gray-50 shadow-inner">
              <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-2 -right-2 p-2.5 bg-black text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <FiEdit2 size={16} />
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              {editing ? (
                <div className="flex gap-2">
                  <input value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border rounded-xl px-4 py-2 outline-none focus:border-black w-full" />
                  <button onClick={() => handleUpdate({ name })} className="bg-black text-white px-4 rounded-xl font-bold text-xs">Save</button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl group cursor-pointer border border-transparent hover:border-gray-200 transition-all" onClick={() => setEditing(true)}>
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <FiEdit2 size={12} className="text-gray-300 group-hover:text-black" />
                </div>
              )}
            </div>
            <InputField label="Username" value={`@${user?.username}`} disabled />
            <InputField label="Email Address" value={user?.email} disabled />
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
              <div className="flex"><span className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter">{user?.role}</span></div>
            </div>
          </div>
        </div>
      </SectionWrapper>
      
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black mb-6">Choose Identity</h3>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map(url => (
                <img 
                  key={url} src={url} 
                  className={`w-full aspect-square rounded-2xl cursor-pointer border-4 transition-all ${user.avatar === url ? 'border-black scale-90' : 'border-transparent hover:scale-105'}`}
                  onClick={() => { handleUpdate({ avatar: url }); setIsAvatarModalOpen(false); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const BuilderSection = () => {
  const { user, setUser, token } = useAuth();
  const [profile, setProfile] = useState({
    skills: user?.builderProfile?.skills?.join(", ") || "",
    preferredRole: user?.builderProfile?.preferredRole || "Other",
    lookingForTeam: user?.builderProfile?.lookingForTeam || false
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    const tid = toast.loading("Syncing with Matching Engine...");
    try {
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          builderProfile: {
            ...profile,
            skills: profile.skills.split(",").map(s => s.trim()).filter(s => s)
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Sync failed");
      setUser(data.user);
      toast.success("Build Space Updated!", { id: tid });
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <SectionWrapper title="Build Space Hub">
      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-900 to-black rounded-3xl text-white shadow-2xl shadow-black/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FiCheckCircle className={profile.lookingForTeam ? "text-green-400" : "text-gray-500"} />
              <h4 className="font-black text-xl tracking-tight">Matching Pool</h4>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visibility for project collaborators</p>
          </div>
          <button 
            type="button"
            onClick={() => setProfile(p => ({ ...p, lookingForTeam: !p.lookingForTeam }))}
            className={`px-8 py-3 rounded-2xl font-black text-xs tracking-widest transition-all ${profile.lookingForTeam ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-white/10 text-white/40 border border-white/10'}`}
          >
            {profile.lookingForTeam ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Core Discipline</label>
            <select 
              value={profile.preferredRole} 
              onChange={e => setProfile({...profile, preferredRole: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black font-bold text-sm"
            >
              {["Frontend", "Backend", "Fullstack", "Designer", "Other"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <InputField 
            label="Key Stack (Comma separated)" 
            placeholder="React, Java, Node..." 
            value={profile.skills}
            onChange={e => setProfile({...profile, skills: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-black tracking-widest shadow-xl hover:-translate-y-1 transition-all active:translate-y-0">UPDATE BUILDER IDENTITY</button>
      </form>
    </SectionWrapper>
  );
};

const SecuritySection = () => {
  const { updateUserPassword } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    if (passwords.newPassword.length < 6) return toast.error("Must be at least 6 characters");
    setIsUpdating(true);
    try {
      await updateUserPassword(passwords.currentPassword, passwords.newPassword);
      toast.success("Security keys updated!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.message); }
    finally { setIsUpdating(false); }
  };

  const handleReset = async () => {
    if(!resetEmail) return toast.error("Email required");
    const tid = toast.loading("Sending link...");
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if(!res.ok) throw new Error("Failed to send");
      toast.success("Check your email!", { id: tid });
      setShowForgotModal(false);
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <SectionWrapper title="Security Access">
      <form onSubmit={handleUpdate} className="max-w-md space-y-6">
        <PasswordInput id="current" name="currentPassword" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} placeholder="Current Password" showState="current" show={show} setShow={setShow} />
        <div className="space-y-4">
          <PasswordInput id="new" name="newPassword" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} placeholder="New Password" showState="new" show={show} setShow={setShow} />
          <PasswordInput id="confirm" name="confirmPassword" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="Confirm New Password" showState="confirm" show={show} setShow={setShow} />
        </div>
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-gray-400 hover:text-black transition-colors">Lost your password?</button>
          <button className="px-8 py-3 bg-black text-white rounded-xl font-bold text-xs tracking-widest">{isUpdating ? "UPDATING..." : "SAVE KEY"}</button>
        </div>
      </form>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Reset Key</h2>
            <p className="text-gray-400 text-sm mb-6 font-medium">Enter email for recovery link.</p>
            <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-gray-50 border p-4 rounded-xl mb-6 outline-none focus:border-black" placeholder="Email address" />
            <div className="flex gap-3">
              <button onClick={() => setShowForgotModal(false)} className="flex-1 py-3 border border-gray-100 rounded-xl font-bold text-xs">CANCEL</button>
              <button onClick={handleReset} className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-xs">SEND LINK</button>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

const AdminSection = ({ setActiveTab }) => {
  const { user, setUser, token } = useAuth();
  const [adminCode, setAdminCode] = useState("");
  const [showModal, setShowModal] = useState(false);

  if (user?.role === 'admin') return null;

  const handleUpgrade = async () => {
    if (adminCode !== ADMIN_SECRET_CODE) return toast.error("Access Denied: Invalid Code");
    const tid = toast.loading("Granting access...");
    try {
      const res = await fetch(`${API_BASE}/user/make-admin`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Server error");
      setUser(prev => ({ ...prev, role: 'admin' }));
      toast.success("Welcome, Administrator", { id: tid });
      setShowModal(false); setActiveTab("My Profile");
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <SectionWrapper title="Advanced Access">
      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
        <div className="space-y-1">
          <p className="font-black text-gray-800 tracking-tight text-lg">Administrator Privileges</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Authorized personnel only</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs tracking-widest">REQUEST</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-6">Security Clearance</h2>
            <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="w-full bg-gray-50 border p-4 rounded-xl mb-6 outline-none focus:border-black tracking-widest text-center" placeholder="••••••••" />
            <div className="flex gap-3"><button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-100 rounded-xl font-bold text-xs">CANCEL</button><button onClick={handleUpgrade} className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-xs">VERIFY</button></div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

const PrivacySection = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/delete`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Wipe failed");
      toast.success("Identity erased");
      logout(); navigate("/login");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <SectionWrapper title="Data Privacy">
      <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-red-600 font-black text-lg tracking-tight">Identity Termination</h4>
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">Permanent erasure of all builder logs and credentials</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs tracking-widest shadow-lg shadow-red-600/20">TERMINATE</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm text-center shadow-2xl">
            <FiShieldOff className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-black mb-2 text-gray-800">Final Confirmation</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">This protocol is irreversible. Are you absolutely certain?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-100 rounded-xl font-bold text-xs">CANCEL</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs">CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

// --- MAIN COMPONENT ---
const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Profile");

  const TABS = [
    { id: "My Profile", icon: <FiUser size={18} /> },
    { id: "Build Space", icon: <FiCode size={18} /> },
    { id: "Security", icon: <FiLock size={18} /> },
    { id: "Privacy", icon: <FiShieldOff size={18} /> }
  ];

  return (
    <div className="w-full text-gray-900 min-h-screen bg-transparent">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 space-y-2 sticky top-8">
          <h2 className="text-3xl font-black mb-10 px-2 tracking-tighter">Account Settings</h2>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-2xl shadow-black/20 translate-x-1' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-800'}`}
            >
              <div className="flex items-center gap-4">
                {tab.icon}
                <span className="text-sm tracking-tight">{tab.id}</span>
              </div>
              <FiChevronRight className={`transition-all ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
          {activeTab === "My Profile" && <ProfileSection />}
          {activeTab === "Build Space" && <BuilderSection />}
          {activeTab === "Security" && <SecuritySection />}
          {activeTab === "Privacy" && <PrivacySection />}
          {user?.role !== 'admin' && activeTab === "Admin Access" && <AdminSection setActiveTab={setActiveTab} />}
          
          {/* Add Admin Access to Sidebar if student */}
          {user?.role !== 'admin' && activeTab !== "Admin Access" && (
            <button 
               onClick={() => setActiveTab("Admin Access")}
               className="mt-4 w-full p-4 border border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-300 tracking-widest uppercase hover:text-black hover:border-black transition-all"
            >
              + Authorized Personnel Access
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;