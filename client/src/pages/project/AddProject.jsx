import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; 
import { 
  IoCloudUploadOutline, 
  IoLogoGithub, 
  IoGlobeOutline, 
  IoImageOutline,
  IoRocketOutline,
  IoEyeOutline,
  IoCodeSlash,
  IoClose,
  IoPersonCircleOutline,
  IoCalendarOutline
} from "react-icons/io5";
import DOMPurify from "dompurify";

const AddProject = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // State
  const [formData, setFormData] = useState({
    title: "",
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

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        toast.error("You must be logged in!");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("shortDescription", formData.shortDescription);
      data.append("blogContent", blogContent); 
      data.append("techStack", formData.techStack);
      data.append("githubLink", formData.githubLink);
      data.append("liveDemoLink", formData.liveDemoLink);
      data.append("videoLink", formData.videoLink);
      if (imageFile) data.append("image", imageFile);

      // ✅ Fetch using the Proxy URL (No http://localhost:5000 needed due to vite.config.js)
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const responseData = await res.json();
      
      if (res.ok) {
        toast.success("✨ Project Launched Successfully!");
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
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-20 relative">
      
      {/* --- EDITOR MODE --- */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 ${showFullPreview ? 'hidden' : 'flex'}`}>
        
        {/* Editor Form */}
        <div className="w-full lg:flex-1">
          <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-slate-900 flex items-center gap-3">
                  <IoRocketOutline className="text-indigo-600" /> Launch Project
              </h1>
              <p className="text-slate-500 font-medium">Share your innovation with the community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Project Name</label>
                  <input type="text" name="title" onChange={handleChange} placeholder="e.g. FocusFlow" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Tech Stack</label>
                  <input type="text" name="techStack" onChange={handleChange} placeholder="React, Node, MongoDB" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Short Description</label>
              <textarea name="shortDescription" onChange={handleChange} rows="3" maxLength="300" placeholder="A quick summary (Max 300 chars)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" required></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">The Full Story (Blog)</label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500">
                <ReactQuill theme="snow" value={blogContent} onChange={setBlogContent} modules={modules} placeholder="Write your story..." className="h-64 mb-12 bg-white text-slate-800" />
              </div>
            </div>

            <div className="space-y-1 pt-4">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Cover Image</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${imageFile ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50 group-hover:border-indigo-400 group-hover:bg-indigo-50"}`}>
                  <IoCloudUploadOutline className={`text-3xl mb-2 ${imageFile ? "text-green-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                  <p className="text-sm font-bold text-slate-600">{imageFile ? imageFile.name : "Click to Upload Cover Image"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                  <IoGlobeOutline className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input type="url" name="liveDemoLink" onChange={handleChange} placeholder="Live Demo Link" className="w-full pl-12 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="relative">
                  <IoLogoGithub className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input type="url" name="githubLink" onChange={handleChange} placeholder="GitHub Repo" className="w-full pl-12 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4">
              {loading ? "Publishing..." : <>Publish Project <IoRocketOutline /></>}
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-6 h-fit">
          <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Preview Card</p>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Live View</span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-lg">
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center opacity-40"><IoImageOutline className="text-4xl text-slate-400" /><p className="text-xs font-bold text-slate-400 mt-2">No Image</p></div>}
                  <div className="absolute top-3 right-3"><span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">Pending</span></div>
              </div>
              <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 break-words">{formData.title || "Your Project Title"}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">by <span className="text-slate-600">You</span></p>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">{formData.shortDescription || "Description..."}</p>
                  <div className="flex gap-2 mt-auto">
                      <div className="px-4 py-2 rounded-xl bg-gray-50 text-slate-400 flex items-center gap-1 font-bold text-xs border border-gray-100"><IoEyeOutline /> 0</div>
                      <button onClick={() => setShowFullPreview(true)} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-md">View Project</button>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* --- PREVIEW MODAL --- */}
      {showFullPreview && (
        <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto animate-in fade-in duration-300">
            <div className="w-full h-[40vh] relative bg-slate-900">
                <img src={previewUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"} alt="Preview" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/60"></div>
                <button onClick={() => setShowFullPreview(false)} className="absolute top-6 left-6 bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-xl hover:scale-105 z-50 border-2 border-white"><IoClose size={20} /> Close Preview</button>
                <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Preview Mode</div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-4">{formData.techStack.split(',').map((t, i) => t.trim() && <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide rounded-full border border-indigo-100">{t}</span>)}</div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">{formData.title || "Untitled Project"}</h1>
                        <div className="flex items-center gap-6 text-sm font-bold text-slate-500 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2"><IoPersonCircleOutline className="text-3xl" /><span className="text-slate-900">{user?.name || "You"}</span></div>
                            <div className="flex items-center gap-1"><IoCalendarOutline /><span>{new Date().toLocaleDateString()}</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-200">
                         {blogContent ? <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-lg" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blogContent) }} /> : <p className="text-slate-400 italic text-center">Start writing your blog...</p>}
                    </div>
                </div>
                <div className="lg:col-span-1"><div className="sticky top-8 space-y-6"><div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"><h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">Project Actions</h3><div className="space-y-3 relative z-10"><button disabled className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider opacity-90 cursor-not-allowed"><IoGlobeOutline size={20} /> Live Demo</button><button disabled className="flex items-center justify-center gap-2 w-full bg-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-wider border border-white/10 cursor-not-allowed"><IoLogoGithub size={20} /> Source Code</button></div></div><div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm"><h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Summary</h3><p className="text-sm text-slate-600 leading-relaxed font-medium">{formData.shortDescription || "No description provided."}</p></div></div></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddProject;