import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify"; // 🛡️ Security
import Loader from "../../components/Loader";
import { 
  IoLogoGithub, 
  IoGlobeOutline, 
  IoArrowBack, 
  IoCalendarOutline,
  IoHeart,
  IoHeartOutline,
  IoShareSocial
} from "react-icons/io5";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false); // Local state for immediate UI feedback

  // Fetch Project Data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProject(data);
          // Check if user already liked (via localStorage for guest support)
          const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
          if (localLikes.includes(id)) setLiked(true);
        } else {
          toast.error("Project not found");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Handle Like (Guest Support)
  const handleLike = async () => {
    if (liked) return; // Prevent double likes from same browser session

    try {
      // Optimistic UI Update
      setLiked(true);
      setProject(prev => ({ ...prev, likes: [...(prev.likes || []), "guest"] })); // Fake add for visual

      // API Call
      await fetch(`/api/projects/${id}/like`, { method: "PUT" });

      // Save to local storage so they can't spam like
      const localLikes = JSON.parse(localStorage.getItem("likedProjects") || "[]");
      localStorage.setItem("likedProjects", JSON.stringify([...localLikes, id]));
      
      toast.success("Thanks for the love! ❤️");
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <Loader />;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-[#5C4033]">Project Not Found</div>;

  return (
    <div className="min-h-screen bg-[#FDF6E3] font-sans text-[#5C4033] selection:bg-[#E76F51]/30 pb-20">
      
      {/* 1. HERO SECTION (Cover Image) */}
      <div className="w-full h-[40vh] md:h-[50vh] relative bg-black">
        <img 
          src={project.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"} 
          alt={project.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF6E3] via-transparent to-black/30"></div>
        
        <Link to="/community" className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition-all">
          <IoArrowBack /> Back to Community
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 2. MAIN CONTENT (Left Col) */}
        <div className="lg:col-span-2">
          
          {/* Header Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#EED9C4] mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#5C4033] mb-4 leading-tight">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#A68A7C]">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E76F51] to-orange-300 ring-2 ring-white"></div>
                <span className="text-[#5C4033]">{project.user?.name || "Anonymous Builder"}</span>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-1">
                <IoCalendarOutline />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

               {/* Likes Counter */}
               <div className="flex items-center gap-1 text-[#E76F51]">
                <IoHeart />
                <span>{project.likes?.length || 0} Likes</span>
              </div>
            </div>
          </div>

          {/* THE BLOG CONTENT (Rich Text Render) */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-[#EED9C4] prose prose-lg max-w-none prose-headings:font-black prose-headings:text-[#5C4033] prose-p:text-[#6B5A50] prose-a:text-[#E76F51]">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.blogContent) }} />
          </div>

          {/* Interaction Bar (Bottom) */}
          <div className="mt-8 flex justify-center gap-4">
             <button 
                onClick={handleLike}
                className={`px-8 py-4 rounded-full font-black text-lg flex items-center gap-2 transition-all transform active:scale-95 shadow-lg ${liked ? "bg-[#E76F51] text-white shadow-orange-200" : "bg-white text-[#5C4033] border-2 border-[#EED9C4] hover:border-[#E76F51]"}`}
             >
                {liked ? <IoHeart /> : <IoHeartOutline />} {liked ? "Liked!" : "Like this Project"}
             </button>
             <button 
                onClick={handleShare}
                className="px-6 py-4 rounded-full bg-white text-[#5C4033] font-bold border-2 border-[#EED9C4] hover:bg-[#FDF6E3] flex items-center gap-2 shadow-sm transition-all"
             >
                <IoShareSocial /> Share
             </button>
          </div>

        </div>


        {/* 3. SIDEBAR (Right Col - Sticky) */}
        <div className="lg:col-span-1">
           <div className="sticky top-8 space-y-6">
              
              {/* Project Actions Card */}
              <div className="bg-[#5C4033] text-[#FDF6E3] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <IoRocketOutline /> Project Actions
                 </h3>

                 <div className="space-y-3">
                    <a 
                      href={project.liveDemoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full bg-[#E76F51] hover:bg-[#D65F43] text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:translate-y-1"
                    >
                       <span className="flex items-center justify-center gap-2"><IoGlobeOutline size={20} /> Live Demo</span>
                    </a>

                    {project.githubLink && (
                      <a 
                        href={project.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-white/10 hover:bg-white/20 text-[#FDF6E3] text-center py-4 rounded-2xl font-bold uppercase tracking-widest transition-all border border-white/10"
                      >
                         <span className="flex items-center justify-center gap-2"><IoLogoGithub size={20} /> Source Code</span>
                      </a>
                    )}
                 </div>
              </div>

              {/* Tech Stack Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-[#EED9C4] shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-[#A68A7C] mb-4">Tech Stack</h3>
                 <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech, i) => (
                       <span key={i} className="px-3 py-1.5 bg-[#FDF6E3] text-[#5C4033] font-bold rounded-lg text-xs border border-[#EED9C4]">
                          {tech}
                       </span>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;