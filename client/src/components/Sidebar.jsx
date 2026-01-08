import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiBookOpen, FiUsers, FiEdit, FiSettings, FiLogOut, FiShield, FiX, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState, useRef, useMemo } from "react";
import Logo from "../assets/logo.png";

// --- 1. Dotted Paper Background (Light Mode Galaxy) ---
const PaperGalaxyBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {/* The Moving Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(blue 1.5px)',
          backgroundSize: '32px 32px', 
          animation: 'paperDrift 120s linear infinite',
        }}
      ></div>
      
      {/* Subtle Vignette to keep focus center */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/10 to-white/60 pointer-events-none"></div>

      <style>{`
        @keyframes paperDrift { 
          0% { background-position: 0 0; } 
          100% { background-position: -64px -64px; } 
        }
        .bg-radial-gradient {
            background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
      `}</style>
    </div>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // --- LOGOUT STATE ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const baseMenuItems = [
    { id: "Home", icon: <FiHome size={22} />, path: "/home" },
    { id: "Community", icon: <FiUsers size={22} />, path: "/community" },
    { id: "Courses", icon: <FiBookOpen size={22} />, path: "/courses" },
    { id: "Quiz", icon: <FiEdit size={22} />, path: "/quizzes" },
  ];

  const menuItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [...baseMenuItems, { id: "Admin", icon: <FiShield size={22} />, path: "/admin-dashboard" }];
    }
    return baseMenuItems;
  }, [user]);

  const bottomItems = [
    { id: "Settings", icon: <FiSettings size={22} />, path: "/settings" },
  ];

  const allItems = [...menuItems, ...bottomItems];
  const menuRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillTop, setPillTop] = useState(0);

  useEffect(() => {
    const index = allItems.findIndex(
      (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, [location.pathname, allItems]);

  useEffect(() => {
    if (window.innerWidth >= 768 && menuRefs.current[activeIndex] && menuRefs.current[0]) {
      const parentTop = menuRefs.current[0].offsetParent?.getBoundingClientRect().top || 0;
      const childRect = menuRefs.current[activeIndex].getBoundingClientRect();
      const childTop = childRect.top || 0;
      const childHeight = childRect.height || 0;
      const pillHeight = 40; 
      setPillTop(childTop - parentTop + childHeight / 2 - pillHeight / 2);
    }
  }, [activeIndex, menuItems]);

  return (
    // 2. Layout Wrapper: p-0 on mobile (Full Bleed), p-4 on desktop (Card look)
    <div className="relative flex flex-col md:flex-row h-screen w-full p-0 md:p-4 font-sans overflow-hidden text-gray-900">
      
      <PaperGalaxyBackground />

      {/* MOBILE HEADER: Sticky top, glass effect, full width */}
      <div className="md:hidden flex items-center justify-between bg-black backdrop-blur-md text-black px-5 py-4 border-b border-gray-200 relative z-50">
        <div className="w-8 h-8">
          <img src={Logo} alt="Logo" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="flex items-center gap-5">
          <NavLink to="/settings" className="text-gray-500 hover:text-black"><FiSettings size={20} /></NavLink>
          {/* LOGOUT BUTTON (Mobile) */}
          <button onClick={handleLogoutClick} className="text-gray-500 hover:text-red-500 transition-colors"><FiLogOut size={20} /></button>
        </div>
      </div>

      {/* DESKTOP SIDEBAR: Hidden on mobile */}
      <div className="hidden md:flex w-20 bg-black text-white flex-col justify-between py-6 items-center rounded-2xl shadow-2xl relative z-20 h-full border border-white/10">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-10 h-10">
            <img src={Logo} alt="Logo" className="w-full h-full rounded-full object-cover ring-2 ring-white/20" />
          </div>
          <div className="flex flex-col gap-6 mt-8 relative w-full items-center">
            <div
              className="absolute -left-4 w-1.5 h-10 bg-white rounded-full transition-all duration-[700ms] ease-in-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ top: pillTop }}
            />
            {menuItems.map((item, index) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/home"}
                className={({ isActive }) => `flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActive ? "bg-white text-black font-bold" : "text-gray-500 hover:text-white"}`}
              >
                <div ref={(el) => (menuRefs.current[index] = el)}>{item.icon}</div>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 relative mt-6 w-full">
          {bottomItems.map((item, index) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActive ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}
            >
              <div ref={(el) => (menuRefs.current[menuItems.length + index] = el)}>{item.icon}</div>
            </NavLink>
          ))}
          {/* LOGOUT BUTTON (Desktop) */}
          <button onClick={handleLogoutClick} className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-red-500 transition-colors" title="Logout">
            <FiLogOut size={22} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="
          flex-1 
          relative z-10
          overflow-y-auto no-scrollbar
          w-full h-full 
          bg-white
          pb-24
          md:ml-4 
          md:rounded-2xl 
          md:shadow-xl 
          md:bg-white/80 
          md:backdrop-blur-xl 
          md:pb-6
          md:h-auto
          md:border md:border-white/50
        ">
        <div className="p-4 md:p-6 min-h-full">
          <Outlet />
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-black text-white flex justify-around py-4 rounded-2xl shadow-2xl z-50">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive
                ? "bg-white text-black scale-110 shadow-lg"
                : "text-gray-500 hover:text-white"
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </div>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 text-center relative animate-in zoom-in-95 duration-200">
            <button 
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
            >
                <FiX size={24} />
            </button>

            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut size={28} className="ml-1" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">Leaving so soon?</h3>
            <p className="text-gray-500 font-medium mb-8">
                Are you sure you want to log out? <br/> Come back soon!
            </p>

            <div className="flex gap-3">
                <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                    Cancel
                </button>
                <button 
                    onClick={confirmLogout}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-black hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    Logout
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}