import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

// --- ICONS ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// --- UPDATED COURSE CARD COMPONENT ---
const CourseCard = ({ course, isAdmin, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const slug = course.title.replace(/\s+/g, "-").toLowerCase();

    const handleCardClick = () => {
        navigate(`/courses/${slug}`, { state: { course } });
    };

    const description = course.description || "A brief overview of the course content, learning objectives, and what students can expect to achieve upon completion.";

    return (
        <div
            onClick={handleCardClick}
            // ✅ Removed the old hover effects (translate, border color/width)
            className="cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col justify-between h-full group transition-all duration-300 relative shadow-sm hover:shadow-xl"
        >
            {/* ✅ This new span creates the border wipe animation on hover */}
            <span className="absolute inset-0 border-2 border-blue-500 rounded-xl scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-in-out"></span>

            {/* Card Content */}
            <div className='p-6 flex flex-col h-full'>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">{course.category}</p>
                <h3 className="text-xl font-bold text-black leading-tight mb-3">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-grow">
                    {description}
                </p>
                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 transition-colors group-hover:text-blue-500 group-hover:underline">
                        View Course →
                    </span>
                    {isAdmin && (
                        <div
                            className="flex items-center gap-2 transition-opacity opacity-100 md:opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => onEdit(course._id)}
                                className="p-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full text-gray-700 transition-colors"
                                aria-label="Edit course"
                            >
                                <FiEdit size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(course._id)}
                                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full text-gray-700 transition-colors"
                                aria-label="Delete course"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl space-y-4 text-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm">{message}</p>
                <div className="flex justify-center gap-4 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 w-24 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 w-24 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COURSES PAGE COMPONENT ---
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

    // State for managing the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:5001/api/courses");
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
    }, []);

    // --- FILTERING LOGIC ---
    useEffect(() => {
        let filtered = courses;
        if (activeCategory !== "All Categories") {
            filtered = filtered.filter(course => course.category === activeCategory);
        }
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredCourses(filtered);
    }, [activeCategory, searchTerm, courses]);

    // --- NAVIGATION HANDLERS ---
    const handleCreate = () => navigate('/create-course');
    const handleEdit = (courseId) => navigate(`/edit-course/${courseId}`);

    // --- DELETE HANDLERS ---
    const handleDeleteClick = (courseId) => {
        setCourseToDelete(courseId);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            const res = await fetch(`http://localhost:5001/api/courses/${courseToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete course.");
            setCourses(prev => prev.filter(c => c._id !== courseToDelete));
            toast.success("Course deleted successfully!");
        } catch (error) {
            toast.error(error.message || "Could not delete the course.");
        } finally {
            setIsModalOpen(false);
            setCourseToDelete(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col font-sans p-4 md:p-6">
            {/* ✅ YOUR HEADER, SEARCH, AND CREATE BUTTON ARE FULLY RESTORED ✅ */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold text-black">Courses</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 text-gray-800 border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></div>
                    </div>
                    {isAdmin && (
                        <button onClick={handleCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                            <FiPlus size={18} />
                            <span>Create</span>
                        </button>
                    )}
                </div>
            </header>

            <section className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center p-10 text-gray-500">Loading courses...</div>
                ) : filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                isAdmin={isAdmin}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick} // Use the new handler
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-gray-100 rounded-2xl">
                        <h3 className="text-xl font-semibold text-black">No courses found</h3>
                        <p className="text-gray-600 mt-2">Try adjusting your search filters.</p>
                    </div>
                )}
            </section>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action is permanent and cannot be undone."
            />
        </div>
    );
};

export default Courses;