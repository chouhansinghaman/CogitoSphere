import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// --- SECRET ADMIN CODE ---
// In a real application, this should be an environment variable on the server.
const ADMIN_SECRET_CODE = "bethe@dmin2028";

// --- HELPER COMPONENT ---
const SectionWrapper = ({ title, children, action = null }) => (
  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold">{title}</h3>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

// --- AVATAR CHOICES ---
// Place this after your imports.

const avatarOptions = [
  "https://i.pinimg.com/736x/51/19/95/511995729851564ed88c865f42e1844b.jpg",
  "https://i.pinimg.com/474x/0a/5f/ca/0a5fca949be9e2f9951f860398fd7c9f.jpg",
  "https://img.freepik.com/free-photo/aesthetic-anime-character-gaming_23-2151560679.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/free-photo/lifestyle-scene-with-people-doing-regular-tasks-anime-style_23-2151002566.jpg",
  "https://img.freepik.com/free-photo/lifestyle-scene-with-people-doing-regular-tasks-anime-style_23-2151002534.jpg?semt=ais_hybrid&w=740&q=80",
  "https://media.craiyon.com/2025-07-22/BVWL-jyLSpey53Hp-YX0UA.webp",
];

// --- PASSWORD INPUT ---
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
                       peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black peer-focus:bg-gray-50"
    >
      {placeholder}
    </label>
    <span
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => setShow((prev) => ({ ...prev, [showState]: !prev[showState] }))}
      className="absolute right-3 top-3 cursor-pointer text-xl select-none transition-transform duration-200 hover:scale-110"
    >
      {show[showState] ? "🙈" : "👁️"}
    </span>
  </div>
);

// --- NEW ADMIN SECTION ---
const AdminSection = ({ setActiveTab }) => {
  const { user, setUser, token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Do not render this section if the user is already an admin
  if (user?.role === 'admin') {
    return null;
  }

  const handleUpgrade = async () => {
    if (adminCode !== ADMIN_SECRET_CODE) {
      return toast.error("The admin code is incorrect.");
    }

    setIsUpgrading(true);
    const toastId = toast.loading("Upgrading to Admin...");

    try {
      // This API endpoint needs to exist on your server
      const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/user/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upgrade to admin.");
      }

      // Update user in the global context
      setUser(prev => ({ ...prev, role: 'admin' }));

      toast.success("Success! You are now an admin.", { id: toastId });
      setShowModal(false);

      // Switch the active tab to "My Profile"
      setActiveTab("My Profile");

    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsUpgrading(false);
      setAdminCode("");
    }
  };

  return (
    <>
      <SectionWrapper title="Admin Access">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Become an Administrator</p>
            <p className="text-sm text-gray-500">Unlock features to create, edit, and manage courses.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Request Access
          </button>
        </div>
      </SectionWrapper>

      {/* Admin Code Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm space-y-4">
            <h2 className="text-xl font-bold">Enter Admin Code</h2>
            <p className="text-gray-600">
              To become an admin, please enter the secret code provided by the system administrator.
            </p>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Secret code..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
            />
            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-70"
              >
                {isUpgrading ? "Verifying..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- SECURITY SECTION ---
const SecuritySection = () => {
  const { updateUserPassword } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password cannot be the same as the current password.");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Updating password...");

    try {
      const successMessage = await updateUserPassword(currentPassword, newPassword);
      toast.success(successMessage, { id: toastId });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return toast.error("Please enter your email.");
    setIsResetting(true);
    const toastId = toast.loading("Sending reset link...");
    try {
      // ✅ Call your backend forgot-password endpoint
      const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link");
      toast.success("Password reset link sent to your email.", { id: toastId });
      setShowForgotModal(false);
      setResetEmail("");
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionWrapper title="Change Password">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <form onSubmit={handlePasswordUpdate} className="space-y-6 w-full max-w-md">
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleInputChange}
              placeholder="Current Password"
              showState="current"
              show={show}
              setShow={setShow}
            />
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleInputChange}
              placeholder="New Password"
              showState="new"
              show={show}
              setShow={setShow}
            />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm New Password"
              showState="confirm"
              show={show}
              setShow={setShow}
            />

            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-medium text-gray-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 rounded-lg font-semibold border border-black text-black bg-white
                         hover:bg-black hover:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Right-side image */}
          <div className="hidden md:block flex-shrink-0">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
              alt="Security Illustration"
              className="w-48 h-48 opacity-90"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-4">Enter your email to receive a reset link.</p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-black"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-70"
              >
                {isResetting ? "Sending..." : "Send Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- PRIVACY SECTION ---
const PrivacySection = () => {
  const [showModal, setShowModal] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.message || "Failed to delete account");

      toast.success("Account deleted successfully!");
      logout();
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <>
      <SectionWrapper title="Account Deletion">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Permanently delete your account and all of its content. This action is irreversible.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700"
        >
          Delete My Account
        </button>
      </SectionWrapper>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold dark:text-gray-100">Confirm Account Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- AVATAR SELECTION MODAL ---
// A new component for the avatar selection UI.

const AvatarSelectionModal = ({ isOpen, onClose, onSelect, currentAvatar, isSaving }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <h3 className="text-xl font-bold mb-4">Choose Your Avatar</h3>
        <div className="grid grid-cols-3 gap-4">
          {avatarOptions.map((avatar) => (
            <button
              key={avatar}
              onClick={() => onSelect(avatar)}
              disabled={isSaving}
              className={`relative aspect-square rounded-full border-4 transition-all focus:outline-none
                ${currentAvatar === avatar ? "border-black" : "border-transparent hover:border-gray-300"}
                ${isSaving && currentAvatar === avatar ? "opacity-50" : ""}`}
            >
              <img src={avatar} alt={`Avatar option`} className="w-full h-full rounded-full object-cover" />
              {isSaving && currentAvatar === avatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED PROFILE SECTION ---

const ProfileSection = () => {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!user) return <div className="text-center p-4">No user data available.</div>;

  const handleNameSave = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setIsSavingName(true);
    try {
      const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update name");
      setUser((prev) => ({ ...prev, name }));
      toast.success("Name updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarSelect = async (newAvatar) => {
    if (newAvatar === user.avatar) return;
    setIsSavingAvatar(true);
    const toastId = toast.loading("Updating avatar...");
    try {
      const payload = {
        name: user.name, // Include the current name to satisfy backend validation
        avatar: newAvatar, // The new avatar URL we want to save
      };

      const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload), // Send the updated payload
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update avatar");

      setUser((prev) => ({ ...prev, avatar: newAvatar }));

      toast.success("Avatar updated!", { id: toastId });
      setIsAvatarModalOpen(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <>
      <SectionWrapper
        title="My Profile"
        action={!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <FiEdit2 /> Edit
          </button>
        )}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 flex-shrink-0">
              <img
                src={user.avatar || "/avatars/default-avatar.png"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiEdit2 size={20} className="text-white" />
              </button>
            </div>
            <div>
              {!editing ? (
                <h3 className="text-xl font-bold">{user.name}</h3>
              ) : (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs focus:outline-none focus:border-black"
                />
              )}
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Username</label>
              <p className="font-medium">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Name</label>
              {!editing ? (
                <p className="font-medium">{user.name}</p>
              ) : (
                <div className="flex gap-2 mt-1">
                  <button onClick={handleNameSave} disabled={isSavingName} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-70">
                    {isSavingName ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); setName(user.name); }} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500">Email Address</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 pr-2">Current Role</label>
              <p className="font-medium capitalize px-2 py-0.5 rounded-full text-xs inline-block bg-blue-100 text-blue-800">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user.avatar}
        isSaving={isSavingAvatar}
      />
    </>
  );
};

// --- MAIN SETTINGS PAGE ---
const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Profile");

  // Dynamically define tabs based on user role
  const TABS = ["My Profile", "Security", "Privacy"];
  if (user?.role !== 'admin') {
    TABS.push("Admin Access");
  }

  return (
    <div className="w-full text-gray-800 p-0 sm:p-0">
      <h1 className="text-3xl font-bold text-black">Account Settings</h1>
      <div className="my-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`whitespace-nowrap px-1 py-2 font-medium text-sm transition-colors ${activeTab === tab
                ? "border-b-2 border-black text-black"
                : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === "My Profile" && <ProfileSection />}
        {activeTab === "Security" && <SecuritySection />}
        {activeTab === "Privacy" && <PrivacySection />}
        {activeTab === "Admin Access" && <AdminSection setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
};

export default Settings;