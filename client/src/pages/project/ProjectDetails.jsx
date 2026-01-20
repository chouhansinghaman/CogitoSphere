import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify"; 
import Loader from "../../components/Loader";
import { 
  IoLogoGithub, 
  IoGlobeOutline, 
  IoArrowBack, 
  IoCalendarOutline,
  IoHeart,
  IoHeartOutline,
  IoShareSocial,
  IoPersonCircleOutline
} from "react-icons/io5";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // 👇👇👇 FIX IS HERE: Change '/project/' to '/projects/' (Plural)
        const res = await fetch(`${API_BASE_URL}/projects/${id}`);
        
        if (!res.ok) {
           throw new Error("Project not found");
        }

        const data = await res.json();
        setProject(data);

        const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
        if (localLikes.includes(id)) setLiked(true);

      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Could not load project.");
        // 👇 Comment this out temporarily if you want to see the error on screen instead of redirecting
        // navigate("/community"); 
      } finally {
        setLoading(false);
      }
    };
    
    if(id) fetchProject();
  }, [id, navigate, API_BASE_URL]);

  // Handle Like
  const handleLike = async () => {
    if (liked) return;
    try {
      setLiked(true);
      setProject(prev => ({ ...prev, likes: [...(prev.likes || []), "guest"] }));
      
      // 👇 FIX HERE TOO: '/projects/' (Plural)
      await fetch(`${API_BASE_URL}/projects/${id}/like`, { method: "PUT" });

      const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
      localStorage.setItem("likedProjects", JSON.stringify([...localLikes, id]));
      toast.success("Liked! ❤️");
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <Loader />;
  if (!project) return <div className="p-10 text-center">Project Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-20">
      {/* ... (Rest of your UI code remains exactly the same) ... */}
      
      <div className="w-full h-[40vh] relative bg-slate-900">
        <img 
          src={project.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"} 
          alt={project.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/60"></div>
        
        <button 
          onClick={() => navigate("/community")} 
          className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all border border-white/10 shadow-xl z-20"
        >
          <IoArrowBack size={18} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack?.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide rounded-full border border-indigo-100">{t}</span>
                ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">{project.title}</h1>
            <div className="flex items-center gap-6 text-sm font-bold text-slate-500 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2">
                {project.user?.avatar ? <img src={project.user.avatar} className="w-8 h-8 rounded-full" /> : <IoPersonCircleOutline className="text-3xl" />}
                <span className="text-slate-900">{project.user?.name || "Builder"}</span>
              </div>
              <div className="flex items-center gap-1"><IoCalendarOutline /><span>{new Date(project.createdAt).toLocaleDateString()}</span></div>
               <div className="flex items-center gap-1 text-pink-500"><IoHeart /><span>{project.likes?.length || 0} Likes</span></div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-200">
             <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-lg" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.blogContent) }} />
          </div>

          <div className="flex justify-center gap-4 py-8">
             <button onClick={handleLike} className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all transform active:scale-95 shadow-lg ${liked ? "bg-pink-500 text-white shadow-pink-200" : "bg-white text-slate-700 border border-gray-200 hover:border-pink-500 hover:text-pink-500"}`}>{liked ? <IoHeart /> : <IoHeartOutline />} {liked ? "Liked" : "Like Project"}</button>
             <button onClick={handleShare} className="px-6 py-4 rounded-full bg-white text-slate-700 font-bold border border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"><IoShareSocial /> Share</button>
          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="sticky top-8 space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">Project Actions</h3>
                 <div className="space-y-3 relative z-10">
                    <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/50 active:translate-y-1"><IoGlobeOutline size={20} /> Live Demo</a>
                    {project.githubLink && (<a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all border border-white/10 backdrop-blur-sm"><IoLogoGithub size={20} /> Source Code</a>)}
                 </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Summary</h3>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">{project.shortDescription}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;