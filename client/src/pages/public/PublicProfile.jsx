import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiGithub, 
  FiLinkedin, 
  FiMail, 
  FiArrowLeft, 
  FiAward, 
  FiCode, 
  FiCpu,
  FiCalendar
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PublicProfile = () => {
  const { id } = useParams(); // Get user ID from URL
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
        navigate(-1); // Go back if error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  if (!profile) return null;

  // Formatting Helper
  const formattedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 font-bold text-sm transition-colors"
        >
          <FiArrowLeft /> Back to Community
        </button>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          
          {/* Header Banner (Optional visual flair) */}
          <div className="h-32 bg-gradient-to-r from-gray-900 to-black w-full"></div>

          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-end gap-6">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
              <div className="mb-2 text-center md:text-left">
                <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
                <p className="text-gray-500 font-medium">@{profile.username || "unknown"}</p>
                <span className="inline-block mt-2 bg-gray-100 text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {profile.role}
                </span>
              </div>
              
              {/* Action Buttons (Socials) */}
              <div className="flex gap-3 ml-auto mb-3">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all text-xl" title="GitHub">
                    <FiGithub />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all text-xl" title="LinkedIn">
                    <FiLinkedin />
                  </a>
                )}
                <a href={`mailto:${profile.email}`} className="p-3 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all text-xl" title="Send Email">
                  <FiMail />
                </a>
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* 1. Study Streak */}
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-orange-500 text-white rounded-xl">
                  <FiAward size={24} />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Quiz Streak</p>
                  <p className="text-2xl font-black">{profile.studyStreak || 0} <span className="text-sm font-medium text-gray-500">days</span></p>
                </div>
              </div>

              {/* 2. Builder Role */}
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <FiCode size={24} />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Builder Role</p>
                  <p className="text-lg font-bold leading-tight">
                    {profile.builderProfile?.preferredRole || "Exploring"}
                  </p>
                </div>
              </div>

              {/* 3. Member Since */}
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-gray-800 text-white rounded-xl">
                  <FiCalendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Joined</p>
                  <p className="text-lg font-bold">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Build Space Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2 mb-3">
                  <FiCpu /> Build Space Status
                </h3>
                <div className="flex gap-4">
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                    profile.builderProfile?.lookingForTeam 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {profile.builderProfile?.lookingForTeam ? "🟢 Open to Collaborate" : "🔴 Not Looking for Team"}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {profile.builderProfile?.skills && profile.builderProfile.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.builderProfile.skills.map((skill, index) => (
                      <span key={index} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;