import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiGithub, 
  FiLinkedin, 
  FiMail, 
  FiArrowLeft, 
  FiAward, 
  FiCode, 
  FiCalendar,
  FiCpu,
  FiCheck,
  FiX,
  FiZap,
  FiUsers,
  FiArrowUpRight,
  FiStar
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/public/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Could not fetch profile");
        setProfile(data);
      } catch (err) {
        toast.error("User not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );

  if (!profile) return null;

  const formattedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Ideas are now fetched by the backend and attached to profile.ideas
  const userIdeas = profile.ideas || []; 

  return (
    <div className="font-sans flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* HEADER BANNER */}
        <div className="relative h-32 bg-gradient-to-r from-neutral-900 to-neutral-800">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-all"
          >
            <FiArrowLeft /> Back
          </button>
        </div>

        {/* PROFILE CONTENT */}
        <div className="px-6 pb-6">
          
          {/* Avatar & Key Info */}
          <div className="flex flex-col sm:flex-row items-end -mt-12 mb-6 gap-4">
            <div className="relative shrink-0">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover bg-white"
              />
              <span className="absolute bottom-1 right-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                {profile.role}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left mb-1">
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{profile.name}</h1>
              <p className="text-gray-500 font-medium text-sm">@{profile.username || "unknown"}</p>
            </div>

            <div className="flex gap-2 mb-2 sm:mb-1">
              {profile.github && <SocialButton href={profile.github} icon={<FiGithub />} label="GitHub" />}
              {profile.linkedin && <SocialButton href={profile.linkedin} icon={<FiLinkedin />} label="LinkedIn" />}
              <SocialButton href={`mailto:${profile.email}`} icon={<FiMail />} label="Email" />
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard 
              icon={<FiAward className="text-orange-600" size={20} />}
              bg="bg-orange-50 border-orange-100"
              label="Daily Login"
              value={`${profile.studyStreak || 0} Days`}
            />
            <StatCard 
              icon={<FiCode className="text-blue-600" size={20} />}
              bg="bg-blue-50 border-blue-100"
              label="Builder Role"
              value={profile.builderProfile?.preferredRole || "Explorer"}
            />
            <StatCard 
              icon={<FiCalendar className="text-gray-600" size={20} />}
              bg="bg-gray-50 border-gray-100"
              label="Member Since"
              value={formattedDate}
            />
          </div>

          {/* SPLIT SECTION: Status/Skills & Projects */}
          <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-6">
            
            {/* LEFT COL: Skills & Status */}
            <div className="md:w-1/3 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FiCpu /> Availability
                </h3>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border w-full ${
                  profile.builderProfile?.lookingForTeam 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {profile.builderProfile?.lookingForTeam 
                    ? <><FiCheck size={14} /> Open to Team</> 
                    : <><FiX size={14} /> Not Looking</>
                  }
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.builderProfile?.skills && profile.builderProfile.skills.length > 0 ? (
                    profile.builderProfile.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-900 text-white px-3 py-1 rounded-md text-[11px] font-bold shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs italic">No skills listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COL: Projects / Ideas */}
            <div className="md:w-2/3 border-l border-gray-100 md:pl-6 pl-0 border-l-0 md:border-l">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiZap className="text-yellow-500" /> Ventures & Ideas
              </h3>

              {userIdeas.length > 0 ? (
                <div className="space-y-3">
                  {userIdeas.map((idea) => {
                    // Logic to check if they are Owner or Member
                    const isOwner = idea.postedBy?._id === profile._id || idea.postedBy === profile._id;
                    
                    return (
                      <div key={idea._id} className="group p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-default">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {idea.title}
                          </h4>
                          {/* Role Badge */}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isOwner 
                              ? "bg-purple-100 text-purple-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {isOwner ? <FiStar size={10} fill="currentColor" /> : <FiUsers size={10} />}
                            {isOwner ? "Owner" : "Member"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                          {idea.description || "No description provided."}
                        </p>
                        
                        {/* Footer: Tags or Status */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <FiUsers size={12} /> {idea.members?.length || 1} team
                          </span>
                           {/* Only allow navigation if it's the Community page logic, usually we navigate back to community */}
                           <span className="ml-auto text-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           Active Project
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">No public projects yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---
const SocialButton = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-black hover:text-white transition-all text-lg"
    title={label}
  >
    {icon}
  </a>
);

const StatCard = ({ icon, bg, label, value }) => (
  <div className={`p-4 ${bg} border rounded-xl flex items-center gap-3`}>
    <div className="bg-white p-2 rounded-lg shadow-sm">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider truncate">{label}</p>
      <p className="text-sm font-black text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default PublicProfile;