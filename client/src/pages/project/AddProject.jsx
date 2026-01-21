import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  IoCloudUploadOutline,
  IoImageOutline,
  IoRocketOutline,
  IoFlashOutline,
  IoCodeSlash,
  IoPeopleOutline, // 👈 New Icon for Team
  IoSearchOutline,
  IoCloseCircle
} from "react-icons/io5";

import { FiArrowRight } from "react-icons/fi";

const AddProject = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // ✅ DYNAMIC URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"; 
  
  // --- STATE ---
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    shortDescription: "",
    techStack: "",
    githubLink: "",
    liveDemoLink: "",
    videoLink: "",
  });

  const [blogContent, setBlogContent] = useState(""); 
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // 👥 TEAM SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // Stores selected users

  // --- TEAM SEARCH LOGIC ---
  useEffect(() => {
    const fetchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/users/search?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter out users already selected
                const filtered = data.filter(u => !teamMembers.some(m => m._id === u._id));
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error("Search error", error);
        }
    };

    // Debounce (Wait 300ms after typing stops)
    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, teamMembers, token, API_BASE_URL]);

  const addMember = (member) => {
    setTeamMembers([...teamMembers, member]);
    setSearchQuery(""); // Clear search
    setSearchResults([]); // Clear results
  };

  const removeMember = (memberId) => {
    setTeamMembers(teamMembers.filter(m => m._id !== memberId));
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.tagline) return toast.error("Please add a catchy tagline!");
    if(!blogContent || blogContent === "<p><br></p>") return toast.error("Please write your project story!");

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("tagline", formData.tagline);
      data.append("shortDescription", formData.shortDescription);
      data.append("blogContent", blogContent); 
      data.append("techStack", formData.techStack);
      data.append("githubLink", formData.githubLink);
      data.append("liveDemoLink", formData.liveDemoLink);
      data.append("videoLink", formData.videoLink);
      
      // 👥 SEND TEAM MEMBERS (As JSON String)
      // We extract just the IDs to send to backend
      const memberIds = teamMembers.map(m => m._id);
      data.append("teamMembers", JSON.stringify(memberIds));

      if (imageFile) data.append("image", imageFile);

      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const textResponse = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(`Server Error: ${res.status}`);
      }
      
      if (res.ok) {
        toast.success("🚀 Project Launched to the Hall of Fame!");
        navigate("/community");
      } else {
        toast.error(responseData.message || "Failed to publish");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-20 relative">
      
      {/* --- PAGE HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-xl font-black flex items-center gap-2"><IoRocketOutline className="text-indigo-600"/> Launchpad</h1>
              <button 
                type="button" 
                onClick={() => navigate('/community')}
                className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest"
              >
                Cancel
              </button>
          </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 ${showFullPreview ? 'hidden' : 'flex'}`}>
        
        {/* --- LEFT: EDITOR FORM --- */}
        <div className="w-full lg:flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black flex items-center gap-2 border-b border-gray-100 pb-4">
                    <IoFlashOutline className="text-yellow-500" /> The Basics
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Project Title</label>
                        <input type="text" name="title" onChange={handleChange} placeholder="e.g. FocusFlow" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-black text-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Tagline (The Punchline)</label>
                        <input type="text" name="tagline" onChange={handleChange} maxLength="100" placeholder="e.g. The productivity app for chaotic minds." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        <p className="text-[10px] text-right text-gray-400 mt-1">{formData.tagline.length}/100</p>
                    </div>
                </div>
            </div>

            {/* 2. Team Credits (NEW SECTION) */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black flex items-center gap-2 border-b border-gray-100 pb-4">
                    <IoPeopleOutline className="text-blue-500" /> Team Credits
                </h3>
                
                <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Add Teammates</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IoSearchOutline className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..." 
                            className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                        
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                {searchResults.map(u => (
                                    <div 
                                        key={u._id} 
                                        onClick={() => addMember(u)}
                                        className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors"
                                    >
                                        <img src={u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u._id} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Selected Members Chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                         {/* Current User (Always Owner) */}
                         <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 cursor-not-allowed opacity-70">
                            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=owner"} className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-bold">{user?.name} (Owner)</span>
                         </div>

                         {/* Added Members */}
                         {teamMembers.map(m => (
                             <div key={m._id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 animate-in fade-in zoom-in duration-200">
                                <img src={m.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + m._id} className="w-5 h-5 rounded-full bg-white" />
                                <span className="text-xs font-bold">{m.name}</span>
                                <button onClick={() => removeMember(m._id)} className="text-indigo-400 hover:text-indigo-900"><IoCloseCircle size={16} /></button>
                             </div>
                         ))}
                    </div>
                </div>
            </div>

            {/* 3. Visuals Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black flex items-center gap-2 border-b border-gray-100 pb-4">
                    <IoImageOutline className="text-purple-500" /> Visuals
                </h3>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Cover Image (Banner)</label>
                    <div className="relative group cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all h-48 ${imageFile ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50 group-hover:border-indigo-400 group-hover:bg-indigo-50"}`}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg shadow-sm" />
                            ) : (
                                <>
                                    <IoCloudUploadOutline className="text-4xl text-slate-300 mb-2 group-hover:text-indigo-400 transition-colors" />
                                    <p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Click to Upload Banner</p>
                                    <p className="text-xs text-slate-400 mt-1">Recommended: 1200x630px</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. The Details Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-6">
                 <h3 className="text-lg font-black flex items-center gap-2 border-b border-gray-100 pb-4">
                    <IoCodeSlash className="text-pink-500" /> The Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Tech Stack (Comma Separated)</label>
                        <input type="text" name="techStack" onChange={handleChange} placeholder="React, Node.js, MongoDB" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Live Demo Link <span className="text-red-500">*</span></label>
                        <input type="url" name="liveDemoLink" onChange={handleChange} placeholder="https://my-app.vercel.app" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" required />
                     </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">GitHub Repo</label>
                        <input type="url" name="githubLink" onChange={handleChange} placeholder="https://github.com/user/repo" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Video Demo (YouTube)</label>
                        <input type="url" name="videoLink" onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Short Description</label>
                    <textarea name="shortDescription" onChange={handleChange} rows="3" maxLength="300" placeholder="A quick summary for the project card (Max 300 chars)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" required></textarea>
                </div>
            </div>

            {/* 5. The Story (Blog) */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">The Full Story</label>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold uppercase">Rich Text Supported</span>
                </div>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500">
                    <ReactQuill theme="snow" value={blogContent} onChange={setBlogContent} modules={modules} placeholder="Tell us how you built it, challenges faced, and future plans..." className="h-80 mb-12 bg-white text-slate-800" />
                </div>
            </div>

            {/* PUBLISH BUTTON */}
            <div className="sticky bottom-6 z-20">
                 <button type="submit" disabled={loading} className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.99] text-lg border-t border-gray-700">
                    {loading ? (
                        <span className="animate-pulse">Uploading Assets...</span>
                    ) : (
                        <>Launch to Community <IoRocketOutline className="animate-bounce" /></>
                    )}
                 </button>
            </div>

          </form>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-28 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Live Preview</p>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Card View</span>
                </div>
                
                {/* PREVIEW CARD UI (Matches Community.jsx) */}
                <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-xl transform transition-all hover:scale-[1.02]">
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center opacity-30">
                                <IoImageOutline className="text-4xl text-slate-400" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm">
                            Season 0
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 break-words">
                            {formData.title || "Untitled Project"}
                        </h3>
                        <p className="text-xs font-bold text-indigo-500 mb-3 line-clamp-1">
                            {formData.tagline || "Your punchy tagline goes here..."}
                        </p>
                        
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            by <span className="text-slate-700">{user?.name || "You"}</span>
                        </p>
                        
                        {/* SHOW TEAMMATES IN PREVIEW */}
                        {teamMembers.length > 0 && (
                            <div className="flex -space-x-2 mb-4">
                                {teamMembers.slice(0,3).map(m => (
                                    <img key={m._id} src={m.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed="+m._id} className="w-6 h-6 rounded-full border border-white" />
                                ))}
                                {teamMembers.length > 3 && <span className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold">+{teamMembers.length - 3}</span>}
                            </div>
                        )}
                        
                        <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {formData.shortDescription || "Your project description will appear here. Make it interesting!"}
                        </p>
                        
                        <div className="mt-auto">
                            <div className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 opacity-50 cursor-default">
                                Read Story <FiArrowRight />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2"><IoFlashOutline /> Pro Tip</h4>
                    <p className="text-indigo-700 text-xs leading-relaxed">
                        Great cover images (1200x630px) and a catchy tagline increase click-through rates by 40%. Don't skip the visuals!
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AddProject;