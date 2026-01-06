import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
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

// --- HELPER COMPONENTS (Your Original Style) ---
const SectionWrapper = ({ title, children, action = null }) => (
  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold">{title}</h3>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

const PasswordInput = ({ id, name, value, onChange, placeholder, showState, show, setShow }) => (
  <div className="relative w-full">
    <input
      id={id}
      name={name}
      type={show[showState] ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="peer h-12 w-full border border-gray-300 rounded-lg px-4 pr-10 placeholder-transparent focus:outline-none focus:border-black"
    />
    <label
      htmlFor={id}
      className="absolute left-4 -top-2.5 bg-gray-50 px-1 text-sm text-gray-600 transition-all 
                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black peer-focus:bg-gray-50"
    >
      {placeholder}
    </label>
    <span
      onClick={() => setShow((prev) => ({ ...prev, [showState]: !prev[showState] }))}
      className="absolute right-3 top-3 cursor-pointer text-xl select-none"
    >
      {show[showState] ? "🙈" : "👁️"}
    </span>
  </div>
);

// --- SECTIONS ---

const ProfileSection = () => {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleUpdate = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setUser(data.user || { ...user, ...payload });
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <SectionWrapper title="Personal Information">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative group">
            <img src={user?.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-gray-50 shadow-md" />
            <button onClick={() => setIsAvatarModalOpen(true)} className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-lg shadow-lg">
              <FiEdit2 size={14} />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
              {editing ? (
                <div className="flex gap-2">
                  <input value={name} onChange={e => setName(e.target.value)} className="bg-white border rounded-lg px-3 py-1.5 outline-none focus:border-black w-full" />
                  <button onClick={() => handleUpdate({ name })} className="text-xs bg-black text-white px-3 rounded-lg">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditing(true)}>
                  <p className="text-lg font-bold">{user?.name}</p>
                  <FiEdit2 size={12} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                </div>
              )}
            </div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase">Username</label><p className="font-medium">@{user?.username}</p></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label><p className="font-medium">{user?.email}</p></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase">Role</label><div className="flex mt-1"><span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">{user?.role}</span></div></div>
          </div>
        </div>
      </SectionWrapper>
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Select Avatar</h3>
            <div className="grid grid-cols-3 gap-3">
              {avatarOptions.map(url => (
                <img key={url} src={url} className={`w-full aspect-square rounded-xl cursor-pointer border-2 ${user.avatar === url ? 'border-black' : 'border-transparent hover:border-gray-200'}`} onClick={() => { handleUpdate({ avatar: url }); setIsAvatarModalOpen(false); }} />
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
    const tid = toast.loading("Syncing with Build Space...");
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
      if (!res.ok) throw new Error("Update failed");
      setUser(data.user);
      toast.success("Build Profile Updated!", { id: tid });
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <SectionWrapper title="Build Space Hub">
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-black rounded-xl text-white">
          <div><h4 className="font-bold">Matching Status</h4><p className="text-xs text-gray-400">Join the matching pool</p></div>
          <button type="button" onClick={() => setProfile(p => ({ ...p, lookingForTeam: !p.lookingForTeam }))} className={`px-6 py-2 rounded-xl font-bold text-xs ${profile.lookingForTeam ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>{profile.lookingForTeam ? 'ACTIVE' : 'INACTIVE'}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 uppercase">Role</label><select value={profile.preferredRole} onChange={e => setProfile({...profile, preferredRole: e.target.value})} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black">{["Frontend", "Backend", "Fullstack", "Designer", "Other"].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-gray-500 uppercase">Skills</label><input value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="React, Java..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black" /></div>
        </div>
        <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-bold">Update Build Space Profile</button>
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    setIsUpdating(true);
    try {
      await updateUserPassword(passwords.currentPassword, passwords.newPassword);
      toast.success("Password updated!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.message); }
    finally { setIsUpdating(false); }
  };

  return (
    <SectionWrapper title="Change Password">
      <form onSubmit={handleUpdate} className="max-w-md space-y-6">
        <PasswordInput id="current" name="currentPassword" value={passwords.currentPassword} onChange={handleInputChange} placeholder="Current Password" showState="current" show={show} setShow={setShow} />
        <PasswordInput id="new" name="newPassword" value={passwords.newPassword} onChange={handleInputChange} placeholder="New Password" showState="new" show={show} setShow={setShow} />
        <PasswordInput id="confirm" name="confirmPassword" value={passwords.confirmPassword} onChange={handleInputChange} placeholder="Confirm New Password" showState="confirm" show={show} setShow={setShow} />
        <div className="flex justify-between items-center"><button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-gray-500 hover:underline">Forgot Password?</button><button className="px-6 py-2 bg-black text-white rounded-lg font-bold">{isUpdating ? "Saving..." : "Update Password"}</button></div>
      </form>
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm"><h2 className="text-xl font-bold mb-4">Reset Password</h2><input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full border p-2 rounded-lg mb-4" placeholder="Email" /><div className="flex gap-2"><button onClick={() => setShowForgotModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button className="flex-1 py-2 bg-black text-white rounded-lg">Send</button></div></div>
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
    if (adminCode !== ADMIN_SECRET_CODE) return toast.error("Incorrect code");
    try {
      const res = await fetch(`${API_BASE}/user/make-admin`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Upgrade failed");
      setUser(prev => ({ ...prev, role: 'admin' }));
      toast.success("Now Admin!"); setShowModal(false); setActiveTab("My Profile");
    } catch (err) { toast.error(err.message); }
  };
  return (
    <SectionWrapper title="Admin Access">
      <div className="flex justify-between items-center"><p className="text-sm">Manage system settings.</p><button onClick={() => setShowModal(true)} className="px-4 py-2 bg-black text-white rounded-lg font-bold">Request Access</button></div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm"><h3 className="font-bold mb-4">Admin Code</h3><input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)} className="w-full border p-2 rounded-lg mb-4" /><div className="flex gap-2"><button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={handleUpgrade} className="flex-1 py-2 bg-black text-white rounded-lg">Submit</button></div></div>
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
    try { await fetch(`${API_BASE}/user/delete`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); toast.success("Deleted"); logout(); navigate("/login"); } catch (err) { toast.error(err.message); }
  };
  return (
    <SectionWrapper title="Privacy">
      <p className="text-sm text-gray-500 mb-4">Irreversible action.</p><button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Delete Account</button>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm text-center"><h3 className="font-bold mb-4">Confirm?</h3><div className="flex gap-2"><button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">No</button><button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Yes</button></div></div>
        </div>
      )}
    </SectionWrapper>
  );
};

// --- MAIN COMPONENT (RESTORED TOP NAV) ---
const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Profile");
  const TABS = ["My Profile", "Build Space", "Security", "Privacy"];
  if (user?.role !== 'admin') TABS.push("Admin Access");

  return (
    <div className="w-full text-gray-900 bg-transparent p-0">
      <h1 className="text-3xl font-black mb-8 px-2">Settings</h1>
      
      {/* RESTORED TOP NAV BAR */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-1 font-bold text-sm transition-all border-b-2 ${
                activeTab === tab ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "My Profile" && <ProfileSection />}
        {activeTab === "Build Space" && <BuilderSection />}
        {activeTab === "Security" && <SecuritySection />}
        {activeTab === "Privacy" && <PrivacySection />}
        {activeTab === "Admin Access" && <AdminSection setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
};

export default Settings;