import React, { useState, useEffect } from "react";
import { FiEdit2, FiCode, FiUser, FiSearch, FiCheck, FiGithub, FiLinkedin } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ADMIN_SECRET_CODE = "bethe@dmin2028";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const avatarOptions = [
  "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg",
  "https://i.pinimg.com/474x/0a/5f/ca/0a5fca949be9e2f9951f860398fd7c9f.jpg",
  "https://img.freepik.com/free-photo/aesthetic-anime-character-gaming_23-2151560679.jpg",
  "https://img.freepik.com/free-photo/lifestyle-scene-with-people-doing-regular-tasks-anime-style_23-2151002566.jpg",
  "https://media.craiyon.com/2025-07-22/BVWL-jyLSpey53Hp-YX0UA.webp",
  "https://img.freepik.com/free-photo/anime-style-portrait-young-business-woman_23-2151002534.jpg"
];

const SectionWrapper = ({ title, subtitle, children }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 transition-all hover:shadow-md">
    <div className="mb-6">
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
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
      placeholder=" "
      required
      className="peer h-14 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pt-4 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase"
    >
      {placeholder}
    </label>
    <span
      onClick={() => setShow((prev) => ({ ...prev, [showState]: !prev[showState] }))}
      className="absolute right-4 top-4 cursor-pointer text-lg select-none text-gray-400 hover:text-black"
    >
      {show[showState] ? "🙈" : "👁️"}
    </span>
  </div>
);

// --- SECTIONS ---

const ProfileSection = () => {
  const { user, setUser, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    github: "",
    linkedin: "",
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Sync state with user context on load
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  // Inside ProfileSection component...

  const handleUpdate = async (extraPayload = {}) => {
    // 1. FRONTEND VALIDATION
    const urlPattern = /^(https?:\/\/[^\s]+)?$/;

    // Check GitHub if it's not empty
    if (formData.github && !urlPattern.test(formData.github)) {
      return toast.error("GitHub link must start with http:// or https://");
    }

    // Check LinkedIn if it's not empty
    if (formData.linkedin && !urlPattern.test(formData.linkedin)) {
      return toast.error("LinkedIn link must start with http:// or https://");
    }

    // 2. PROCEED TO SAVE
    try {
      const payload = { ...formData, ...extraPayload };
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setUser(prev => ({
        ...prev,
        ...data.user,
        ...payload
      }));

      toast.success("Profile updated!");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <SectionWrapper title="Personal Information" subtitle="Manage your public identity">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="relative group mx-auto md:mx-0">
            <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-gray-300 hover:border-black transition-all">
              <img src={user?.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <button onClick={() => setIsAvatarModalOpen(true)} className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-lg">
              <FiEdit2 size={16} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-6 w-full">
            {/* Name Field */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-black transition-all font-medium"
              />
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                  <FiGithub /> GitHub Profile
                </label>
                <input
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="github.com/username"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-black transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                  <FiLinkedin /> LinkedIn Profile
                </label>
                <input
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-black transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Username</label>
                <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                  <span className="text-gray-400">@</span>
                  <span className="font-medium">{user?.username || "Not set"}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                <div className="text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium text-sm">
                  {user?.email || "Not set"}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Role</label>
                <span className="inline-block bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{user?.role}</span>
              </div>
              <button
                onClick={() => handleUpdate()}
                className="bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black mb-6 text-center">Choose your style</h3>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map(url => (
                <img
                  key={url}
                  src={url}
                  className={`w-full aspect-square rounded-2xl cursor-pointer object-cover transition-all duration-200 ${user.avatar === url ? 'ring-4 ring-black scale-95' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                  onClick={() => { handleUpdate({ avatar: url }); setIsAvatarModalOpen(false); }}
                />
              ))}
            </div>
            <button onClick={() => setIsAvatarModalOpen(false)} className="w-full mt-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

const BuilderSection = () => {
  const { user, setUser, token } = useAuth();
  const [profile, setProfile] = useState({
    skills: "",
    preferredRole: "Fullstack Developer", // Default matches your enum options
    lookingForTeam: false
  });

  // Sync state with user context on load
  useEffect(() => {
    if (user?.builderProfile) {
      setProfile({
        skills: user.builderProfile.skills?.join(", ") || "",
        preferredRole: user.builderProfile.preferredRole || "Fullstack Developer",
        lookingForTeam: user.builderProfile.lookingForTeam || false
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const tid = toast.loading("Updating Build Space...");

    // Prepare the data cleanly before sending
    const processedSkills = profile.skills.split(",").map(s => s.trim()).filter(s => s);
    
    // ✅ CRITICAL FIX: Merge with existing user.builderProfile
    // This ensures we don't wipe out 'interests' or 'portfolioLink' if they exist
    const updatedBuilderProfile = {
      ...user?.builderProfile, // Keep existing backend data
      ...profile,              // Overwrite with form data
      skills: processedSkills  // Overwrite skills as array
    };

    try {
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          builderProfile: updatedBuilderProfile
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Force update the context with our local data immediately
      setUser(prev => ({
        ...prev,
        ...data.user,
        builderProfile: updatedBuilderProfile
      }));

      toast.success("Updated!", { id: tid });
    } catch (err) { toast.error(err.message, { id: tid }); }
  };

  return (
    <SectionWrapper title="Build Space Hub" subtitle="Customize your developer card for matching">
      <form onSubmit={handleUpdate} className="space-y-6">

        {/* Status Card */}
        <div className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${profile.lookingForTeam ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${profile.lookingForTeam ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              <FiSearch size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">{profile.lookingForTeam ? "Ready to Match" : "Not Looking"}</h4>
              <p className="text-xs text-gray-500">Visible in the pool</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProfile(p => ({ ...p, lookingForTeam: !p.lookingForTeam }))}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${profile.lookingForTeam ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white border border-gray-300 text-gray-600'}`}
          >
            {profile.lookingForTeam ? 'ACTIVE' : 'OFFLINE'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FiUser /> Preferred Role
            </label>
            <div className="relative">
              <select
                value={profile.preferredRole}
                onChange={e => setProfile({ ...profile, preferredRole: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 appearance-none outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer font-medium"
              >
                {/* These values must match the backend Enum exactly */}
                {["Frontend Developer", "Backend Developer", "Fullstack Developer", "UI/UX Designer", "Product Manager", "Other"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FiCode /> Skills & Tech
            </label>
            <input
              value={profile.skills}
              onChange={e => setProfile({ ...profile, skills: e.target.value })}
              placeholder="e.g. React, Node.js, Figma..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black font-medium"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.split(",").filter(s => s.trim()).map((tag, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold uppercase">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2">
            <FiCheck /> Save Build Profile
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
};

const SecuritySection = () => {
  const { token } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    if (passwords.newPassword.length < 6) return toast.error("Password too short");

    setIsUpdating(true);
    try {
      // BUG FIX 3: Robust error handling to catch non-JSON server errors
      const res = await fetch(`${API_BASE}/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      // Handle cases where server returns raw text error instead of JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(text || "Server Error (Non-JSON response)");
      }

      if (!res.ok) throw new Error(data.message || "Failed to update password");

      toast.success("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SectionWrapper title="Security" subtitle="Update your password and security settings">
      <form onSubmit={handleUpdate} className="max-w-lg space-y-6">
        <PasswordInput id="current" name="currentPassword" value={passwords.currentPassword} onChange={handleInputChange} placeholder="Current Password" showState="current" show={show} setShow={setShow} />
        <PasswordInput id="new" name="newPassword" value={passwords.newPassword} onChange={handleInputChange} placeholder="New Password" showState="new" show={show} setShow={setShow} />
        <PasswordInput id="confirm" name="confirmPassword" value={passwords.confirmPassword} onChange={handleInputChange} placeholder="Confirm New Password" showState="confirm" show={show} setShow={setShow} />

        <div className="flex justify-end pt-2">
          <button disabled={isUpdating} className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50">
            {isUpdating ? "Saving..." : "Update Password"}
          </button>
        </div>
      </form>
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
      const res = await fetch(`${API_BASE}/users/make-admin`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Upgrade failed");
      const data = await res.json();
      setUser(data.user);
      toast.success("Welcome, Admin!");
      setShowModal(false);
      setActiveTab("My Profile");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <SectionWrapper title="Admin Access" subtitle="Elevate your privileges">
      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <div>
          <h4 className="font-bold">Request Admin Status</h4>
          <p className="text-sm text-gray-500">Requires a secret verification code.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-black text-white rounded-lg font-bold text-sm">Unlock</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-1">Enter Admin Code</h3>
            <p className="text-sm text-gray-500 mb-6">Ask a system administrator for the key.</p>
            <input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)} className="w-full border-2 border-gray-200 p-3 rounded-xl mb-4 outline-none focus:border-black font-mono text-center tracking-widest" placeholder="●●●●●●●●" />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpgrade} className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800">Verify</button>
            </div>
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
      await fetch(`${API_BASE}/users/delete`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      toast.success("Account deleted");
      logout();
      navigate("/login");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <SectionWrapper title="Danger Zone" subtitle="Irreversible account actions">
      <div className="border border-red-100 bg-red-50 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h4 className="font-bold text-red-900">Delete Account</h4>
          <p className="text-sm text-red-600">All your data will be permanently removed.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">Delete</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm text-center shadow-2xl">
            <h3 className="text-2xl font-black mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Profile");
  const TABS = ["My Profile", "Build Space", "Security", "Privacy"];
  if (user?.role !== 'admin') TABS.push("Admin Access");

  return (
    <div className="w-full text-gray-900 bg-transparent p-0 font-sans">
      <h1 className="text-4xl font-black mb-8 px-2 tracking-tight">Settings</h1>

      {/* Navigation */}
      <div className="mb-8 border-b border-gray-100">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === tab ? "border-black text-black scale-105" : "border-transparent text-gray-400 hover:text-black"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 max-w-4xl">
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