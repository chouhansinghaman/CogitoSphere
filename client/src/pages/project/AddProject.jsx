import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { 
  IoCloudUploadOutline, 
  IoLogoGithub, 
  IoPlayCircleOutline, 
  IoGlobeOutline,
  IoCodeSlash,
  IoRocketOutline,
  IoEyeOutline
} from "react-icons/io5";

const AddProject = () => {
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    techStack: "",
    githubLink: "",
    liveDemoLink: "",
    videoLink: "",
  });

  const [blogContent, setBlogContent] = useState(""); // 👈 Separate state for Rich Text
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
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const data = new FormData();
      data.append("title", formData.title);
      data.append("shortDescription", formData.shortDescription);
      data.append("blogContent", blogContent); // 👈 Send the HTML
      data.append("techStack", formData.techStack);
      data.append("githubLink", formData.githubLink);
      data.append("liveDemoLink", formData.liveDemoLink);
      data.append("videoLink", formData.videoLink);
      if (imageFile) data.append("image", imageFile);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const responseData = await res.json();
      if (res.ok) {
        toast.success("✨ Story Published!");
        navigate("/dashboard");
      } else {
        toast.error(responseData.message || "Failed");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // Quill Modules (Toolbar settings)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen font-sans text-[#5C4033] lg:p-10 flex justify-center">
      
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-8">
        
        {/* 📝 LEFT COLUMN: The Editor */}
        <div className="w-full lg:flex-1 bg-white border-2 border-[#EED9C4] p-8 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#D4A373]">
          
          <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight mb-2 text-[#5C4033] flex items-center gap-3">
                  <IoRocketOutline /> Share Your Journey
              </h1>
              <p className="text-[#A68A7C] font-bold text-sm">
                  Don't just share code. Tell the story behind the build.
              </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Title & Tech */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#A68A7C] tracking-wider ml-1">Project Name</label>
                  <input type="text" name="title" onChange={handleChange} placeholder="e.g. FocusFlow" className="w-full bg-[#FDF6E3] border border-[#EED9C4] rounded-xl p-4 font-bold focus:border-[#E76F51] outline-none transition-all" required />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#A68A7C] tracking-wider ml-1">Tech Stack</label>
                  <input type="text" name="techStack" onChange={handleChange} placeholder="React, Node, MongoDB" className="w-full bg-[#FDF6E3] border border-[#EED9C4] rounded-xl p-4 font-bold focus:border-[#E76F51] outline-none transition-all" />
              </div>
            </div>

            {/* 2. Short Description (The Hook) */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#A68A7C] tracking-wider ml-1">The "Elevator Pitch" (Short Description)</label>
              <textarea name="shortDescription" onChange={handleChange} rows="3" maxLength="300" placeholder="A 2-sentence summary for the project card..." className="w-full bg-[#FDF6E3] border border-[#EED9C4] rounded-xl p-4 font-medium focus:border-[#E76F51] outline-none transition-all resize-none" required></textarea>
              <p className="text-[10px] text-right text-[#A68A7C] font-bold">{formData.shortDescription.length}/300</p>
            </div>

            {/* 3. THE BLOG EDITOR (Rich Text) */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#A68A7C] tracking-wider ml-1">The Full Story (Blog)</label>
              <div className="bg-[#FDF6E3] rounded-xl overflow-hidden border border-[#EED9C4] focus-within:border-[#E76F51] transition-colors">
                <ReactQuill 
                    theme="snow" 
                    value={blogContent} 
                    onChange={setBlogContent} 
                    modules={modules}
                    placeholder="Write about your challenges, your wins, and how you built it..."
                    className="h-64 mb-12" // mb-12 to make space for the toolbar
                />
              </div>
            </div>

            {/* 4. Image Upload */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#A68A7C] tracking-wider ml-1">Cover Image</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${imageFile ? "border-green-500 bg-green-50" : "border-[#EED9C4] bg-[#FDF6E3] group-hover:border-[#E76F51]"}`}>
                  <IoCloudUploadOutline className={`text-3xl mb-2 ${imageFile ? "text-green-500" : "text-[#A68A7C] group-hover:text-[#E76F51]"}`} />
                  <p className="text-sm text-[#5C4033] font-bold">{imageFile ? imageFile.name : "Upload Cover Image"}</p>
                </div>
              </div>
            </div>

            {/* 5. Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                  <IoGlobeOutline className="absolute top-4 left-4 text-[#A68A7C] text-xl" />
                  <input type="url" name="liveDemoLink" onChange={handleChange} placeholder="Live Demo (Required)" className="w-full pl-12 bg-[#FDF6E3] border border-[#EED9C4] rounded-xl p-4 font-bold focus:border-[#E76F51] outline-none" required />
              </div>
              <div className="relative">
                  <IoLogoGithub className="absolute top-4 left-4 text-[#A68A7C] text-xl" />
                  <input type="url" name="githubLink" onChange={handleChange} placeholder="GitHub (Optional)" className="w-full pl-12 bg-[#FDF6E3] border border-[#EED9C4] rounded-xl p-4 font-bold focus:border-[#E76F51] outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#5C4033] text-[#FFF8E7] font-black py-4 rounded-xl shadow-lg hover:bg-[#4A332A] hover:scale-[1.01] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? "Publishing..." : <>Publish Project <IoRocketOutline /></>}
            </button>
          </form>
        </div>


        {/* 👁️ RIGHT COLUMN: The Card Preview */}
        <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-6 h-fit">
          <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-xs font-black uppercase text-[#A68A7C] tracking-wider">Preview Card</p>
              <span className="text-[10px] bg-[#E76F51] text-white px-2 py-1 rounded-full font-bold">What they see</span>
          </div>
          
          <div className="bg-white border-2 border-[#EED9C4] rounded-[2rem] overflow-hidden shadow-xl">
              
              {/* Image */}
              <div className="h-48 w-full bg-[#FDF6E3] relative overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <div className="flex flex-col items-center opacity-30">
                          <IoImageOutline className="text-4xl text-[#5C4033]" />
                          <p className="text-xs font-bold text-[#5C4033]">No Image</p>
                      </div>
                  )}
                  {formData.techStack && (
                       <div className="absolute top-3 right-3">
                           <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] text-[#5C4033] font-black border border-[#EED9C4] shadow-sm">
                              {formData.techStack.split(",")[0]}
                          </div>
                      </div>
                  )}
              </div>

              {/* Content */}
              <div className="p-6">
                  <h3 className="text-xl font-black text-[#5C4033] leading-tight mb-2 break-words">
                      {formData.title || "Untitled Project"}
                  </h3>
                 
                  <p className="text-[#A68A7C] text-sm line-clamp-3 mb-4 leading-relaxed font-medium">
                      {formData.shortDescription || "Your short description will appear here..."}
                  </p>
                  
                  {/* Fake Stats */}
                  <div className="flex items-center gap-4 border-t border-[#FDF6E3] pt-4 mt-4">
                      <div className="flex items-center gap-1 text-[#5C4033] font-bold text-xs">
                         <IoEyeOutline /> 0
                      </div>
                      <div className="ml-auto text-[10px] font-bold text-[#A68A7C] uppercase tracking-wider">
                          Just Now
                      </div>
                  </div>
              </div>
              
              {/* "Read Blog" Button Simulator */}
              <div className="px-6 pb-6">
                  <button disabled className="w-full py-3 bg-[#FDF6E3] text-[#5C4033] font-bold rounded-xl text-xs uppercase tracking-widest opacity-50 cursor-default">
                      Read Blog
                  </button>
              </div>
          </div>

          <div className="mt-6 bg-[#E76F51]/10 p-4 rounded-2xl border border-[#E76F51]/20">
              <p className="text-xs text-[#E76F51] font-bold text-center">
                  💡 Tip: Use the blog section to explain <i>how</i> you solved the problem. Good stories get more likes!
              </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper icon for preview
const IoImageOutline = (props) => (
    <svg fill="currentColor" width="1em" height="1em" viewBox="0 0 512 512" {...props}><path d="M416 64H96a64.07 64.07 0 00-64 64v256a64.07 64.07 0 0064 64h320a64.07 64.07 0 0064-64V128a64.07 64.07 0 00-64-64zm-80 64a48 48 0 11-48 48 48.05 48.05 0 0148-48zM96 416a32 32 0 01-32-32v-67.63l94.84-84.3a48.06 48.06 0 0165.8 1.9l64.95 64.81L172.37 416zm352-32a32 32 0 01-32 32H225.25l136-136a48.09 48.09 0 0168.1.2L448 300.9z"/></svg>
)

export default AddProject;