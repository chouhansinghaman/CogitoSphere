import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  IoCloudUploadOutline, 
  IoLogoGithub, 
  IoPlayCircleOutline, 
  IoImageOutline,
  IoCodeSlash,
  IoRocketOutline
} from "react-icons/io5";

const AddProject = () => {
  const navigate = useNavigate();
  
  // State for Text Inputs
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveDemoLink: "",
    videoLink: "",
  });

  // State for Image File & Previews
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Handle Text Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Selection (Create Local Preview)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit Check
        toast.error("File size too large (Max 5MB)");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 👈 Creates instant preview
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      if (!token) {
        toast.error("Please Login first");
        return navigate("/login");
      }

      // 📦 Step 1: Wrap everything in FormData
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("techStack", formData.techStack); // Backend will split this string
      data.append("githubLink", formData.githubLink);
      data.append("liveDemoLink", formData.liveDemoLink);
      data.append("videoLink", formData.videoLink);
      
      // Only append image if user selected one
      if (imageFile) {
        data.append("image", imageFile); 
      }

      // 🚀 Step 2: Send Single Request
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ IMPORTANT: Do NOT set "Content-Type". 
          // Browser automatically sets it to "multipart/form-data" with boundary.
        },
        body: data,
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success("✨ Project Launched Successfully!");
        navigate("/dashboard");
      } else {
        toast.error(responseData.message || "Failed to launch project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup memory for preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="text-white flex flex-col lg:flex-row gap-8 items-start justify-center font-sans">
      
      {/* 📝 LEFT COLUMN: The Form */}
      <div className="w-full lg:flex-1 border border-white/10 p-8 rounded-3xl shadow-2xl bg-[#050505]">
        
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                <IoRocketOutline /> Launch Project
            </h1>
            <p className="text-zinc-400">
                Share your innovation with the community. Build your legacy.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Title & Tech */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Project Name</label>
                <input 
                  type="text" 
                  name="title" 
                  onChange={handleChange} 
                  placeholder="e.g. Neural Network Visualizer" 
                  className="w-full bg-black/40 border border-zinc-700 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all focus:bg-black/60" 
                  required 
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Tech Stack</label>
                <input 
                  type="text" 
                  name="techStack" 
                  onChange={handleChange} 
                  placeholder="React, TensorFlow, AWS" 
                  className="w-full bg-black/40 border border-zinc-700 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all focus:bg-black/60" 
                />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">The Story</label>
            <textarea 
              name="description" 
              onChange={handleChange} 
              rows="5" 
              placeholder="What problem does this solve? How did you build it?" 
              className="w-full bg-black/40 border border-zinc-700 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all focus:bg-black/60 resize-none" 
              required
            ></textarea>
          </div>

          {/* Row 3: Image Upload Area */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Cover Image</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${imageFile ? "border-green-500/50 bg-green-500/5" : "border-zinc-700 bg-black/20 group-hover:border-indigo-500 group-hover:bg-indigo-500/5"}`}>
                <IoCloudUploadOutline className={`text-3xl mb-2 ${imageFile ? "text-green-400" : "text-zinc-500 group-hover:text-indigo-400"}`} />
                <p className="text-sm text-zinc-400 font-medium">
                  {imageFile ? (
                    <span className="text-green-400">{imageFile.name}</span>
                  ) : (
                    "Click to Upload Cover Image"
                  )}
                </p>
                <p className="text-xs text-zinc-600 mt-1">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Row 4: Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
                <IoLogoGithub className="absolute top-4 left-4 text-zinc-500 text-xl group-focus-within:text-white transition-colors" />
                <input 
                  type="url" 
                  name="githubLink" 
                  onChange={handleChange} 
                  placeholder="GitHub Repository URL" 
                  className="w-full pl-12 bg-black/40 border border-zinc-700 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all" 
                  required 
                />
            </div>
            <div className="relative group">
                <IoPlayCircleOutline className="absolute top-4 left-4 text-zinc-500 text-xl group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="url" 
                  name="videoLink" 
                  onChange={handleChange} 
                  placeholder="YouTube Demo URL (Optional)" 
                  className="w-full pl-12 bg-black/40 border border-zinc-700 rounded-xl p-4 focus:border-indigo-500 outline-none transition-all" 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>Launch to Leaderboard <IoRocketOutline /></>
            )}
          </button>
        </form>
      </div>


      {/* 👁️ RIGHT COLUMN: The Live Preview Card */}
      <div className="w-full lg:w-[400px] flex-shrink-0 sticky top-6">
        <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Live Preview</p>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700">What others see</span>
        </div>
        
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl group hover:border-zinc-700 transition-colors">
            
            {/* Logic: If no content, show Placeholder State */}
            {!formData.title && !formData.description && !previewUrl ? (
                <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-40">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <IoCodeSlash className="text-3xl text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 font-medium">Start typing to generate your project card...</p>
                </div>
            ) : (
                // Logic: Active Preview State
                <>
                    {/* Image Area */}
                    <div className="h-48 w-full bg-zinc-900 relative overflow-hidden">
                        <img 
                            src={previewUrl || "https://images.unsplash.com/photo-1607799275518-d58665d096c2?auto=format&fit=crop&w=800&q=80"} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                             <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/10 shadow-lg">
                                {formData.techStack.split(",")[0] || "Tech"}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                             <h3 className="text-xl font-bold text-white leading-tight break-words">
                                {formData.title || "Untitled Project"}
                            </h3>
                        </div>
                       
                        <p className="text-zinc-400 text-sm line-clamp-3 mb-5 leading-relaxed">
                            {formData.description || "Your project description will appear here..."}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {formData.techStack.split(",").map((tech, i) => (
                                tech.trim() && (
                                    <span key={i} className="text-[10px] bg-zinc-900 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded">
                                        {tech}
                                    </span>
                                )
                            ))}
                        </div>

                        {/* Footer (Fake User Info) */}
                        <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-black"></div>
                            <div>
                                <p className="text-xs text-white font-bold">You</p>
                                <p className="text-[10px] text-zinc-500">Just Now</p>
                            </div>
                            <div className="ml-auto">
                                <IoLogoGithub className="text-xl text-zinc-600" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>

    </div>
  );
};

export default AddProject;