import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiBookOpen, FiUsers, FiEdit, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState, useRef } from "react";
import Logo from "../assets/Logo.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: "Home", icon: <FiHome size={22} />, path: "/home" },
    { id: "Courses", icon: <FiBookOpen size={22} />, path: "/courses" },
    { id: "Community", icon: <FiUsers size={22} />, path: "/community" },
    { id: "Quiz", icon: <FiEdit size={22} />, path: "/quizzes" },
  ];

  const bottomItems = [
    { id: "Settings", icon: <FiSettings size={22} />, path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allItems = [...menuItems, ...bottomItems];
  const menuRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillTop, setPillTop] = useState(0);

  // Update active index based on location
  useEffect(() => {
    // Match exact path or if current path starts with the menu path
    const index = allItems.findIndex(
      (item) =>
        location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, [location.pathname]);


  // Center pill relative to active item
  useEffect(() => {
    if (menuRefs.current[activeIndex]) {
      const parentTop =
        menuRefs.current[0].offsetParent?.getBoundingClientRect().top || 0;
      const childRect = menuRefs.current[activeIndex].getBoundingClientRect();
      const childTop = childRect.top || 0;
      const childHeight = childRect.height || 0;

      const pillHeight = 40; // same as h-10 (10*4 = 40px)
      setPillTop(childTop - parentTop + childHeight / 2 - pillHeight / 2);
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 p-4">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-black text-white px-4 py-3 rounded-2xl shadow-md mb-4">
        <div className="w-10 h-10">
          <img
            src={Logo}
            alt="Company Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <div className="flex items-center gap-4">
          <NavLink to="/settings" className="text-gray-300 hover:text-white">
            <FiSettings size={22} />
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition-colors duration-300"
          >
            <FiLogOut size={22} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex w-20 bg-black text-white flex-col justify-between py-6 items-center rounded-2xl shadow-lg relative">
          {/* Top Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10">
              <img
                src={Logo}
                alt="ScholarSphere Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            {/* Top menu */}
            <div className="flex flex-col gap-6 mt-8 relative w-full items-center">
              {/* Sliding pill */}
              <div
                className="absolute -left-4 w-1.5 h-10 bg-white rounded-full transition-all duration-[700ms] ease-in-out"
                style={{ top: pillTop }}
              />

              {menuItems.map((item, index) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center justify-center w-10 h-10 rounded-lg group ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`
                  }
                >
                  <div ref={(el) => (menuRefs.current[index] = el)}>
                    {item.icon}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Bottom menu */}
          <div className="flex flex-col items-center gap-6 relative mt-6">
            {bottomItems.map((item, index) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-lg ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`
                }
              >
                <div
                  ref={(el) =>
                    (menuRefs.current[menuItems.length + index] = el)
                  }
                >
                  {item.icon}
                </div>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white transition-colors duration-300"
            >
              <FiLogOut size={22} />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div
          className="
            flex-1 bg-white rounded-2xl shadow-md 
            p-6 transition-all duration-300
            overflow-y-auto no-scrollbar
            ml-0 md:ml-6         
            pb-24 md:pb-6        
            max-w-md mx-auto md:max-w-none md:mx-0
          "
        >
          <Outlet />
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-black text-white flex justify-around py-3 rounded-2xl shadow-lg">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-2xl ${isActive ? "bg-white text-black" : "text-gray-400 hover:text-white"
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
