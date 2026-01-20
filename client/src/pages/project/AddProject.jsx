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
  IoCodeSlash
} from "react-icons/io5";

const AddProject = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
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
        navigate("/login");
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

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Token from useAuth
        body: data,
      });

      const responseData = await res.json();
      
      if (res.ok) {
        toast.success("✨ Project Launched Successfully!");
        navigate("/community"); 
      } else {
        console.error("Server Error:", responseData);
        toast.error(responseData.message || "Failed to publish");
      }
    } catch (err) {
      console.error("Network Error:", err);
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
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* 📝 LEFT COLUMN: Editor Form */}
        <div className="w-full lg:flex-1">
          
          <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-slate-900 flex items-center gap-3">
                  <IoRocketOutline className="text-indigo-600" /> Launch Project
              </h1>
              <p className="text-slate-500 font-medium">
                  Share your innovation with the community. Tell the story behind the code.
              </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            
            {/* 1. Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Project Name</label>
                  <input 
                    type="text" 
                    name="title" 
                    onChange={handleChange} 
                    placeholder="e.g. FocusFlow" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    required 
                  />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Tech Stack</label>
                  <input 
                    type="text" 
                    name="techStack" 
                    onChange={handleChange} 
                    placeholder="React, Node, MongoDB" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                  />
              </div>
            </div>

            {/* 2. Short Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">The "Elevator Pitch" (Short Description)</label>
              <textarea 
                name="shortDescription" 
                onChange={handleChange} 
                rows="3" 
                maxLength="300" 
                placeholder="A quick summary for the project card (Max 300 chars)..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none" 
                required
              ></textarea>
              <p className="text-[10px] text-right text-slate-400 font-bold">{formData.shortDescription.length}/300</p>
            </div>

            {/* 3. Rich Text Blog */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">The Full Story (Blog)</label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <ReactQuill 
                    theme="snow" 
                    value={blogContent} 
                    onChange={setBlogContent} 
                    modules={modules}
                    placeholder="Write about your challenges, your wins, and how you built it..."
                    className="h-64 mb-12 bg-white text-slate-800" 
                />
              </div>
            </div>

            {/* 4. Image Upload */}
            <div className="space-y-1 pt-4">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Cover Image</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${imageFile ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50 group-hover:border-indigo-400 group-hover:bg-indigo-50"}`}>
                  <IoCloudUploadOutline className={`text-3xl mb-2 ${imageFile ? "text-green-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                  <p className="text-sm font-bold text-slate-600">{imageFile ? imageFile.name : "Click to Upload Cover Image"}</p>
                  <p className="text-xs text-slate-400 mt-1">Recommended: 16:9 Aspect Ratio</p>
                </div>
              </div>
            </div>

            {/* 5. Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                  <IoGlobeOutline className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input type="url" name="liveDemoLink" onChange={handleChange} placeholder="Live Demo Link (Required)" className="w-full pl-12 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
              </div>
              <div className="relative">
                  <IoLogoGithub className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input type="url" name="githubLink" onChange={handleChange} placeholder="GitHub Repo (Optional)" className="w-full pl-12 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {loading ? "Publishing..." : <>Publish Project <IoRocketOutline /></>}
            </button>
          </form>
        </div>


        {/* 👁️ RIGHT COLUMN: Live Preview */}
        <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-6 h-fit">
          <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Preview Card</p>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Live View</span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-lg">
              
              {/* Image Area */}
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                  {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <div className="flex flex-col items-center opacity-40">
                          <IoImageOutline className="text-4xl text-slate-400" />
                          <p className="text-xs font-bold text-slate-400 mt-2">No Image Selected</p>
                      </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                       <span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                           Pending
                       </span>
                  </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 break-words">
                      {formData.title || "Your Project Title"}
                  </h3>
                  
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      by <span className="text-slate-600">You</span>
                  </p>
                 
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {formData.shortDescription || "Your short description will appear here..."}
                  </p>
                  
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                      {formData.techStack.split(",").map((t, i) => (
                          t.trim() && <span key={i} className="px-2 py-1 bg-gray-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-gray-200">{t}</span>
                      ))}
                      {!formData.techStack && <span className="px-2 py-1 bg-gray-50 text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-gray-200">Tech</span>}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                      <div className="px-4 py-2 rounded-xl bg-gray-50 text-slate-400 flex items-center gap-1 font-bold text-xs border border-gray-100">
                          <IoEyeOutline /> 0
                      </div>
                      <button disabled className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 text-white opacity-90 cursor-default">
                          View Project
                      </button>
                  </div>
              </div>
          </div>

          <div className="mt-6 bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <div className="flex items-start gap-3">
                  <IoCodeSlash className="text-indigo-600 text-xl mt-0.5" />
                  <div>
                      <h4 className="font-bold text-indigo-900 text-sm">Pro Tip</h4>
                      <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                          Great documentation wins hackathons. Use the <b>Blog</b> section to explain the "Why" and "How" of your project.
                      </p>
                  </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProject;