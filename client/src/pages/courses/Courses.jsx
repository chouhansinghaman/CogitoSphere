import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { 
  FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiSearch, 
  FiBookOpen, FiCode, FiDatabase, FiLayout, FiCpu, FiServer 
} from 'react-icons/fi';

// --- HELPER: Get Icon based on Category ---
const getCategoryIcon = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("backend") || cat.includes("database")) return FiDatabase;
    if (cat.includes("frontend") || cat.includes("design")) return FiLayout;
    if (cat.includes("system") || cat.includes("devops")) return FiServer;
    if (cat.includes("algorithm") || cat.includes("dsa")) return FiCpu;
    return FiCode; 
};

// --- SUB-COMPONENT: Course Card (Redesigned) ---
const CourseCard = ({ course, isAdmin, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const slug = course.title.replace(/\s+/g, "-").toLowerCase();
  const Icon = getCategoryIcon(course.category);
  const description = course.description || "Start your journey with this module.";

  return (
    <div 
        className="group relative w-full h-full flex flex-col cursor-pointer"
        onClick={() => navigate(`/courses/${slug}`, { state: { course } })}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-10 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Card Content */}
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
        
        {/* Admin Controls (Floating Top Right) */}
        {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(course._id); }} 
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all"
                >
                    <FiEdit2 size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(course._id); }} 
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-lg shadow-sm transition-all"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        )}

        <div>
            {/* Header with Icon */}
            <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                   <Icon size={24} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {course.category}
                </div>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
            </h3>
            
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">
                {description}
            </p>
        </div>

        {/* Footer */}
        <div>
            <div className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-lg shadow-gray-200">
                Start Module <FiBookOpen />
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600 mb-4">
          <FiAlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 font-medium mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200">Delete</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const Courses = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState(["All Categories"]);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const url = API_URL.endsWith("/api") ? `${API_URL}/courses` : `${API_URL}/courses`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
        const uniqueCategories = ["All Categories", ...new Set(data.map(course => course.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error(error.message || "Could not fetch courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [API_URL]);

  // --- FILTERING ---
  useEffect(() => {
    let filtered = courses;
    if (activeCategory !== "All Categories") filtered = filtered.filter(course => course.category === activeCategory);
    if (searchTerm) filtered = filtered.filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCourses(filtered);
  }, [activeCategory, searchTerm, courses]);

  // --- ACTIONS ---
  const handleCreate = () => navigate('/create-course');
  const handleEdit = (courseId) => navigate(`/edit-course/${courseId}`);
  const handleDeleteClick = (courseId) => {
    setCourseToDelete(courseId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const url = API_URL.endsWith("/api") ? `${API_URL}/courses/${courseToDelete}` : `${API_URL}/courses/${courseToDelete}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course.");
      setCourses(prev => prev.filter(c => c._id !== courseToDelete));
      toast.success("Course deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsModalOpen(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="p-6 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-black mb-1">Knowledge Base</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Season 0 • Curriculum</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
            </div>

            {/* Admin Create Button */}
            {isAdmin && (
                <button 
                    onClick={handleCreate} 
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-gray-200"
                >
                    <FiPlus size={16} /> <span className="hidden md:inline">Create</span>
                </button>
            )}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${
                        activeCategory === cat 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    {cat}
                </button>
            ))}
          </div>
      </div>

      {/* GRID SECTION */}
      <section>
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading curriculum...</div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course._id} 
                course={course} 
                isAdmin={isAdmin} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <h3 className="text-gray-900 font-bold mb-1">No courses found</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Try a different category</p>
          </div>
        )}
      </section>

      {/* MODAL */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Module"
        message="Are you sure? This will permanently remove this course and all its data."
      />
    </div>
  );
};

export default Courses;