import { useState } from "react";
import {
  FaGraduationCap,
  FaHome,
  FaBookOpen,
  FaUsers,
  FaBell,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { id: "home", icon: <FaHome size={20} />, label: "Home" },
  { id: "courses", icon: <FaBookOpen size={20} />, label: "Courses" },
  { id: "community", icon: <FaUsers size={20} />, label: "Community" },
  { id: "notifications", icon: <FaBell size={20} />, label: "Notifications" },
  { id: "settings", icon: <FaCog size={20} />, label: "Settings" },
];

export default function Sidebar() {
  const [active, setActive] = useState("home");
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    nav("/login"); // redirect user back to login after logout
  };

  return (
    <aside className="bg-black text-white flex flex-col items-center py-6 rounded-r-3xl min-h-screen w-20 shadow-lg">
      {/* Logo */}
      <div className="mb-10">
        <FaGraduationCap size={28} className="text-green-400" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-center space-y-6 flex-1">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative group flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${active === item.id ? "bg-green-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
          >
            {item.icon}
            {/* Tooltip */}
            <span className="absolute left-16 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded-md px-2 py-1 transition">
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Profile Icon at bottom */}
      <div className="mt-auto mb-4">
        <div className="p-3 rounded-full bg-gray-800 hover:bg-green-500 cursor-pointer transition">
          <FaUser size={22} />
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700"
      >
        Logout
      </button>
    </aside>
  );
}
