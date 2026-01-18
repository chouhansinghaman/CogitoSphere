import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { IoCloudUploadOutline, IoLogoGithub, IoPlayCircleOutline, IoImageOutline } from "react-icons/io5";

const AddProject = () => {
  const navigate = useNavigate();
  
  // State for Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveDemoLink: "",
    image: "", // This will store the URL after upload
    videoLink: "",
  });

  // State for UI handling
  const [imageFile, setImageFile] = useState(null); // The actual file selected
  const [uploading, setUploading] = useState(false); // Spinner for image upload
  const [submitting, setSubmitting] = useState(false); // Spinner for final submit

  // Cloudinary Config (REPLACE THESE WITH YOURS)
  const CLOUD_NAME = "YOUR_CLOUD_NAME_HERE"; 
  const UPLOAD_PRESET = "YOUR_UNSIGNED_PRESET_HERE"; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a fake local URL just for the preview (makes it instant)
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  // 2. The Cloudinary Upload Logic
  const uploadToCloudinary = async () => {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", UPLOAD_PRESET); 
    data.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url; // Returns the HTTP link
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    let finalImageUrl = formData.image;

    try {
      // Step A: If there is a file, upload it to Cloudinary first
      if (imageFile) {
        setUploading(true);
        const uploadedUrl = await uploadToCloudinary();
        setUploading(false);

        if (!uploadedUrl) {
            setSubmitting(false);
            return; // Stop if upload failed
        }
        finalImageUrl = uploadedUrl;
      }

      // Step B: Send the data to OUR Backend
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      if (!token) {
        toast.error("Please Login first");
        return navigate("/login");
      }

      const formattedData = {
        ...formData,
        image: finalImageUrl, // Send the Cloudinary URL
        techStack: formData.techStack.split(",").map((t) => t.trim()),
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        toast.success("✨ Project Live on Leaderboard!");
        navigate("/dashboard");
      } else {
        toast.error("Failed to submit project");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col lg:flex-row gap-8">
      
      {/* 📝 LEFT: THE FORM (Now takes more space if needed) */}
      <div className="flex-1 bg-zinc-900/50 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl h-fit">
        <h1 className="text-3xl font-black mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Submit Project
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="title" onChange={handleChange} placeholder="Project Name" className="bg-black/40 border border-zinc-700 rounded-xl p-3 outline-none focus:border-indigo-500 w-full" required />
            <input type="text" name="techStack" onChange={handleChange} placeholder="Tech Stack (React, Node...)" className="bg-black/40 border border-zinc-700 rounded-xl p-3 outline-none focus:border-indigo-500 w-full" />
          </div>

          <textarea name="description" onChange={handleChange} rows="5" placeholder="Tell the story behind your project..." className="bg-black/40 border border-zinc-700 rounded-xl p-3 outline-none focus:border-indigo-500 w-full" required></textarea>

          {/* Image Upload Input */}
          <div className="bg-black/20 border border-dashed border-zinc-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors relative">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center">
                <IoCloudUploadOutline className="text-3xl text-indigo-400 mb-2" />
                <p className="text-sm text-zinc-400">{imageFile ? imageFile.name : "Click to Upload Cover Image"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <IoLogoGithub className="absolute top-3.5 left-4 text-zinc-500 text-lg" />
                <input type="url" name="githubLink" onChange={handleChange} placeholder="GitHub URL" className="pl-12 bg-black/40 border border-zinc-700 rounded-xl p-3 outline-none focus:border-indigo-500 w-full" required />
            </div>
            <div className="relative">
                <IoPlayCircleOutline className="absolute top-3.5 left-4 text-zinc-500 text-lg" />
                <input type="url" name="videoLink" onChange={handleChange} placeholder="Demo Video URL" className="pl-12 bg-black/40 border border-zinc-700 rounded-xl p-3 outline-none focus:border-indigo-500 w-full" />
            </div>
          </div>

          <button type="submit" disabled={submitting || uploading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all">
            {uploading ? "Uploading Image..." : submitting ? "Submitting..." : "🚀 Launch Project"}
          </button>
        </form>
      </div>

      {/* 👁️ RIGHT: LIVE PREVIEW (Sticky) */}
      <div className="w-full lg:w-[400px] flex-shrink-0 sticky top-6 h-fit">
        <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-4 text-center">Live Preview</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl min-h-[300px] flex flex-col">
            
            {/* LOGIC: Check if user has started typing */}
            {!formData.title && !formData.description && !imageFile ? (
                // 🛑 STATE 1: EMPTY (Placeholder)
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                    <IoImageOutline className="text-6xl text-zinc-700 mb-4" />
                    <p className="text-zinc-500 font-medium">Start filling the form to see the magic happen here...</p>
                </div>
            ) : (
                // 🟢 STATE 2: LIVE PREVIEW
                <>
                    <div className="h-48 w-full bg-zinc-800 relative group">
                        <img 
                            src={formData.image || "https://via.placeholder.com/800x400?text=Your+Image"} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                        {/* Fake "View Project" overlay effect */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold border border-white px-4 py-1 rounded-full">View Details</span>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-xl font-bold text-white leading-tight">
                                {formData.title || "Untitled Project"}
                            </h3>
                            <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded border border-green-500/20">
                                Pending
                            </span>
                        </div>
                       
                        <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
                            {formData.description || "Description will appear here..."}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.techStack.split(",").map((tech, i) => (
                                tech.trim() && (
                                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                                        {tech}
                                    </span>
                                )
                            ))}
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