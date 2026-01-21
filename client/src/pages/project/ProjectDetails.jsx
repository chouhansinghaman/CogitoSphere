import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { useAuth } from "../../context/AuthContext";

import {
    IoLogoGithub,
    IoGlobeOutline,
    IoArrowBack,
    IoCalendarOutline,
    IoHeart,
    IoHeartOutline,
    IoShareSocial,
    IoPersonCircleOutline,
    IoLogoYoutube,
    IoCodeSlash,
    IoFlashOutline,
    IoExpand,
    IoClose,
    IoPeopleOutline // 👈 New Icon
} from "react-icons/io5";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // ✅ STATE FOR FULL SCREEN IMAGE
    const [isImageOpen, setIsImageOpen] = useState(false);

    // --- FETCH PROJECT ---
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/projects/${id}`);
                if (!res.ok) throw new Error("Project not found");

                const data = await res.json();
                setProject(data);
                setLikeCount(data.likes?.length || 0);

                // 🚨 FIX STARTS HERE 🚨
                if (user) {
                    // SCENARIO 1: LOGGED IN USER
                    // Only check if their ID is in the server array. 
                    // Do NOT look at localStorage.
                    const hasLiked = data.likes?.includes(user._id);
                    setLiked(hasLiked);
                } else {
                    // SCENARIO 2: GUEST (NOT LOGGED IN)
                    // Only then do we check localStorage
                    const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
                    setLiked(localLikes.includes(id));
                }
                // 🚨 FIX ENDS HERE 🚨

            } catch (err) {
                console.error("Fetch Error:", err);
                toast.error("Could not load project.");
                navigate("/community");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProject();
    }, [id, navigate, API_BASE_URL, user]); // Added 'user' to dependencies so it updates if you log in/out

    // --- HANDLE LIKE ---
    const handleLike = async () => {
        if (liked) return;

        try {
            setLiked(true);
            setLikeCount(prev => prev + 1);
            toast.success("Glad you liked it! ☕");

            await fetch(`${API_BASE_URL}/projects/${id}/like`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
            if (!localLikes.includes(id)) {
                localStorage.setItem("likedProjects", JSON.stringify([...localLikes, id]));
            }
        } catch (error) {
            console.error(error);
            setLiked(false);
            setLikeCount(prev => prev - 1);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (loading) return <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center text-stone-400">Loading...</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans text-stone-800 pb-20 selection:bg-amber-200 selection:text-amber-900">

            {/* ✅ FIXED FULL SCREEN IMAGE OVERLAY (Z-Index 100) */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageOpen(false)} // Click background to close
                >
                    <button
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    >
                        <IoClose size={32} />
                    </button>
                    {/* Stop propagation so clicking image doesn't close it */}
                    <div className="relative max-w-7xl max-h-screen w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={project.image}
                            alt="Project Full"
                            className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}

            {/* 1. HERO HEADER (Original Layout) */}
            <div className="relative w-full h-[60vh] lg:h-[70vh] bg-stone-900 overflow-hidden group">

                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={project.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-60 transition-transform duration-[3s] ease-out group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-[#1c1917]/50 to-[#1c1917]/30"></div>
                </div>

                {/* Navbar */}
                <div className="absolute top-0 left-0 w-full p-6 z-20">
                    <button
                        onClick={() => navigate("/community")}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all border border-white/10 group"
                    >
                        <IoArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                </div>

                {/* Hero Content (Original Position) */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 pb-24 md:pb-28 max-w-7xl mx-auto z-10">
                    <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in space-y-4">

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {project.techStack?.slice(0, 4).map((t, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-900/40 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-500/30">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F5F4] leading-[1.1] drop-shadow-lg max-w-4xl">
                            {project.title}
                        </h1>

                        {/* Tagline & View Image Button */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            {project.tagline && (
                                <p className="text-lg md:text-2xl text-stone-300 font-light max-w-2xl leading-relaxed">
                                    {project.tagline}
                                </p>
                            )}

                            {/* BUTTON TO OPEN FULL SCREEN */}
                            <button
                                onClick={() => setIsImageOpen(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 w-fit whitespace-nowrap"
                            >
                                <IoExpand /> View Full UI
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* --- LEFT COLUMN: Blog & User Info (Original Layout) --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* User Info Bar */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {project.user?.avatar ? (
                                    <img src={project.user.avatar} alt="User" className="w-14 h-14 rounded-full border-4 border-[#FDFCF8] shadow-sm object-cover" />
                                ) : (
                                    <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 border-4 border-[#FDFCF8] shadow-sm">
                                        <IoPersonCircleOutline className="text-3xl" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">Created By</p>
                                <p className="text-stone-900 font-bold text-lg">{project.user?.name || "Anonymous Builder"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0 sm:pl-6">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><IoCalendarOutline /> Date</p>
                                <p className="text-stone-700 font-semibold text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><IoHeart /> Likes</p>
                                <p className="text-stone-700 font-semibold text-sm">{likeCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Blog Content */}
                    <article className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 min-h-[400px]">
                        <div
                            className="prose prose-lg md:prose-xl prose-stone max-w-none 
                prose-headings:font-black prose-headings:text-stone-900 
                prose-p:text-stone-600 prose-p:leading-8 
                prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-lg"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.blogContent) }}
                        />

                        {/* Interaction Area */}
                        <div className="mt-16 pt-10 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <p className="text-stone-500 font-medium italic">Enjoyed this read?</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleShare}
                                    className="px-6 py-3 rounded-xl bg-[#FDFCF8] text-stone-600 font-bold border border-stone-200 hover:bg-stone-50 flex items-center gap-2 shadow-sm transition-all hover:-translate-y-1"
                                >
                                    <IoShareSocial className="text-lg" /> Share
                                </button>
                                <button
                                    onClick={handleLike}
                                    disabled={liked}
                                    className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg active:scale-95 ${liked
                                            ? "bg-red-50 text-red-600 border border-red-100 cursor-default"
                                            : "bg-stone-800 text-stone-50 hover:bg-stone-900 hover:shadow-xl hover:-translate-y-1"
                                        }`}
                                >
                                    {liked ? <IoHeart className="animate-bounce" /> : <IoHeartOutline />}
                                    {liked ? "Liked" : "Like Project"}
                                </button>
                            </div>
                        </div>
                    </article>
                </div>

                {/* --- RIGHT COLUMN: Sidebar (Sticky) --- */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-8 space-y-6">

                        {/* Action Card */}
                        <div className="bg-[#292524] text-stone-100 p-8 rounded-3xl shadow-2xl relative overflow-hidden group border border-stone-700/50">
                            {/* Abstract Shapes */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600 rounded-full blur-[70px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 text-stone-200">
                                <IoFlashOutline className="text-amber-400" /> Actions
                            </h3>

                            <div className="space-y-3 relative z-10">
                                <a
                                    href={project.liveDemoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-6 py-4 w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-900/40 hover:shadow-amber-600/40 hover:-translate-y-0.5 group/btn"
                                >
                                    <span>View Live Demo</span>
                                    <IoGlobeOutline size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                </a>

                                {project.githubLink && (
                                    <a
                                        href={project.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between px-6 py-4 w-full bg-white/5 hover:bg-white/10 text-stone-200 rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-sm"
                                    >
                                        <span>Source Code</span>
                                        <IoLogoGithub size={20} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* 👥 TEAM CARD (NEW SECTION) */}
                        {project.teamMembers && project.teamMembers.length > 0 && (
                            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                                    <IoPeopleOutline className="text-lg" /> The Squad
                                </h3>

                                <div className="space-y-4">
                                    {/* 1. Project Lead (Owner) */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                                        <img
                                            src={project.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=owner"}
                                            className="w-10 h-10 rounded-full bg-white border border-stone-200 object-cover"
                                            alt="Lead"
                                        />
                                        <div>
                                            <Link to={`/u/${project.user?._id}`} className="text-sm font-bold text-stone-900 hover:underline">
                                                {project.user?.name}
                                            </Link>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Project Lead</p>
                                        </div>
                                    </div>

                                    {/* 2. Collaborators */}
                                    {project.teamMembers.map((member) => (
                                        <div key={member._id} className="flex items-center gap-3 px-3">
                                            <img
                                                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member._id}`}
                                                className="w-10 h-10 rounded-full bg-white border border-stone-200 object-cover"
                                                alt={member.name}
                                            />
                                            <div>
                                                <Link to={`/u/${member._id}`} className="text-sm font-bold text-stone-900 hover:underline">
                                                    {member.name}
                                                </Link>
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Collaborator</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                                <IoCodeSlash /> Tech & Specs
                            </h3>
                            <p className="text-stone-600 leading-relaxed font-medium mb-8">
                                {project.shortDescription}
                            </p>

                            <div className="border-t border-stone-100 pt-6">
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack?.map((t, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-stone-50 text-stone-600 text-xs font-bold uppercase rounded-lg border border-stone-200 cursor-default">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetails;