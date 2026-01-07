import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { 
  FiArrowLeft, FiMaximize2, FiMinimize2, FiBookOpen, 
  FiClock, FiSun, FiMoon, FiHash 
} from "react-icons/fi";
import "react-quill/dist/quill.snow.css"; 

export default function CourseDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  
  // States for View Modes
  const [focusMode, setFocusMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 

  // Ref for the fullscreen container
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!course) {
        setLoading(true);
        try {
          const url = API_URL.endsWith("/api") ? `${API_URL}/courses/${id}` : `${API_URL}/courses/${id}`;
          const res = await fetch(url, {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error("Course not found");
          
          const data = await res.json();
          setCourse(data);
        } catch (err) {
          toast.error("Failed to load module.");
          navigate("/courses");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [id, course, navigate, API_URL, token]);

  // --- TOGGLES ---
  const toggleFocusMode = async () => {
    if (!focusMode) {
        try {
            if (containerRef.current.requestFullscreen) {
                await containerRef.current.requestFullscreen();
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
        setFocusMode(true);
        setIsDarkMode(true); // Auto-dark for focus
    } else {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        setFocusMode(false);
        setIsDarkMode(false);
    }
  };

  useEffect(() => {
      const handleFullScreenChange = () => {
          if (!document.fullscreenElement) setFocusMode(false);
      };
      document.addEventListener("fullscreenchange", handleFullScreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-gray-400">Loading Module...</div>
      </div>
  );
  
  if (!course) return null;

  return (
    <div 
        ref={containerRef}
        className={`
            font-sans transition-colors duration-500 flex flex-col w-full
            ${focusMode 
                ? 'fixed inset-0 z-[9999] overflow-y-auto' 
                : 'min-h-screen relative' 
            }
            ${isDarkMode ? 'bg-zinc-950 text-gray-200' : 'bg-gray-50 text-gray-900'}
        `}
    >
      
      {/* --- HEADER --- */}
      <div className={`
        transition-all duration-300 z-50 px-6 py-4 flex justify-between items-center border-b backdrop-blur-md
        ${focusMode 
            ? `fixed top-0 left-0 right-0 ${isDarkMode ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-gray-200'}` 
            : `sticky top-0 w-full ${isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-gray-200'}`
        }
      `}>
        <button
          onClick={() => navigate("/courses")}
          className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
        >
          <FiArrowLeft /> <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-4">
            
            {/* ID Badge */}
            <div className={`hidden md:flex items-center gap-2 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${isDarkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-900' : 'border-gray-200 text-gray-400 bg-gray-100'}`}>
                <FiHash size={10} /> 
                <span>ID: {course._id.slice(-6)}</span>
            </div>

            <div className={`w-px h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-300'}`}></div>

            {/* Dark/Light Toggle */}
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-gray-200'}`}
                title="Toggle Theme"
            >
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Focus Mode Toggle */}
            <button
                onClick={toggleFocusMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${
                    isDarkMode 
                    ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    : "bg-black text-white hover:scale-105 shadow-md"
                }`}
            >
                {focusMode ? <><FiMinimize2 size={14}/> Exit</> : <><FiMaximize2 size={14}/> Focus</>}
            </button>
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className={`flex-1 w-full flex justify-center ${focusMode ? 'pt-24' : ''}`}>
        
        {/* FIX: Width increased to 95% (almost full width) or max-w-7xl for large screens */}
        <div className={`relative w-full transition-all duration-500 px-4 md:px-0 max-w-[95%] md:max-w-[96%] xl:max-w-[1600px]`}>
            
            {/* Glow (Visible in Dark Mode) */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-[2rem] blur-2xl transition-opacity duration-500 ${isDarkMode ? 'opacity-15' : 'opacity-0'}`}></div>

            <div className={`
                relative w-full transition-all duration-500 min-h-[85vh]
                ${focusMode 
                    ? `p-6 md:p-12 rounded-none md:rounded-[2rem] ${isDarkMode ? 'bg-zinc-900' : 'bg-white shadow-2xl'}` 
                    : `p-6 md:p-10 border-x border-b ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`
                }
            `}>
                
                {/* Title Section */}
                <div className={`mb-8 pb-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                    <div className="flex gap-2 mb-6">
                        <span className={`px-3 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'bg-zinc-950 text-blue-400 border-zinc-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            <FiBookOpen /> {course.category}
                        </span>
                        <span className={`px-3 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'bg-zinc-950 text-gray-400 border-zinc-800' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            <FiClock /> Reading
                        </span>
                    </div>

                    <h1 className={`text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {course.title}
                    </h1>
                    <p className={`text-lg font-medium leading-relaxed max-w-4xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {course.description}
                    </p>
                </div>

                {/* Rich Text Content */}
                <div className={`
                    prose prose-lg max-w-none 
                    prose-headings:font-black 
                    prose-a:text-blue-500 
                    prose-img:rounded-2xl 
                    ${isDarkMode ? 'prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-white' : 'prose-p:text-gray-800 prose-headings:text-gray-900'}
                `}>
                    <div
                        className={`ql-editor !p-0 !overflow-visible 
                        ${isDarkMode 
                            ? '[&_p]:!text-gray-300 [&_li]:!text-gray-300 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_strong]:!text-white [&_b]:!text-white [&_span]:!text-gray-300 [&_div]:!text-gray-300 [&_td]:!text-gray-300 [&_th]:!text-gray-300 [&_a]:!text-blue-400' 
                            : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: course.content }}
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: focusMode ? "1.15rem" : "1rem",
                            lineHeight: "1.9",
                            // FIX: Force text color based on mode to override default quill styles
                            color: isDarkMode ? '#e5e7eb' : '#1f2937' 
                        }}
                    />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}