import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useMinimumLoadingTime } from "../../hooks/useMinimumLoadingTime";
import { registerApi, loginApi } from "../../services/api.auth.js";

// Icons
import { 
  IoArrowBack, IoPerson, IoAt, IoTrophy, IoChatbubbles 
} from "react-icons/io5";
import { FiMail, FiLock, FiUser, FiHash } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Reduced wait time to 500ms
  const shouldDisplayLoader = useMinimumLoadingTime(
    isApiLoading || isTransitioning,
    500
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsApiLoading(true);

    try {
      const { confirmPassword, ...apiData } = formData;

      await registerApi(apiData); // Register

      const loginRes = await loginApi(formData.email, formData.password); // Auto Login
      login(loginRes.data.token, loginRes.data.user);

      toast.success("Account created! Welcome!");
      
      // Force hard redirect
      window.location.href = "/home";

    } catch (err) {
      if (err.response) {
        if (typeof err.response.data === "string" && err.response.data.includes("<!DOCTYPE")) {
          toast.error("Server returned an unexpected response. Please try again.");
          console.error("API Error: Expected JSON but received HTML.", err.response);
        } else {
          toast.error(err.response.data.message || "Registration failed");
        }
      } else {
        toast.error("Registration failed. Please check your connection.");
      }
      setIsApiLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => navigate("/login"), 500);
  };

  if (user) return null; 
  if (shouldDisplayLoader) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#050505] text-zinc-100 selection:bg-indigo-500/30">
      
      {/* --- LEFT PANEL: FORM --- */}
      <div className="relative flex flex-col justify-center items-center px-8 py-12 order-2 lg:order-1">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold"
        >
          <IoArrowBack /> Back to Home
        </button>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2 text-white">Claim your ID.</h1>
            <p className="text-zinc-500 font-medium">
              Join the guild. Start shipping.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                    <FiHash />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="dev_alex"
                    className="w-full h-12 pl-10 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                    <FiUser />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Chen"
                    className="w-full h-12 pl-10 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <FiMail />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-11 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                  required
                />
              </div>
            </div>

            {/* Row 2: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                    <FiLock />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-lg hover:scale-110 transition-transform"
                    role="button"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                    <FiLock />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-lg hover:scale-110 transition-transform"
                    role="button"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isApiLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {isApiLoading ? "Generating ID..." : "Start Journey"}
            </button>
          </form>

          <p className="text-sm text-center text-zinc-500 mt-8 font-medium">
            Already part of the squad?{" "}
            <button onClick={handleSwitchToLogin} className="text-white hover:text-indigo-400 font-bold transition-colors">
              Log In
            </button>
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: BENTO GRID --- */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#0A0A0A] p-12 border-l border-white/5 relative overflow-hidden order-1 lg:order-2">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10">
            {/* Card 1: Community */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                 <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
                    <IoChatbubbles size={20} />
                </div>
                 <h3 className="text-xl font-bold text-white mb-1">Global Chat.</h3>
                 <p className="text-xs text-zinc-500 font-medium">Connect with builders worldwide.</p>
            </div>

            {/* Card 2: Leaderboard */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
                <IoTrophy className="text-yellow-500 text-3xl mb-2" />
                <div>
                  <h3 className="text-lg font-bold text-white">Rank Up.</h3>
                  <p className="text-xs text-zinc-400">Earn badges & XP.</p>
                </div>
            </div>

            {/* Card 3: Profile */}
            <div className="col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                    <IoPerson size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Dev Profile</h3>
                    <p className="text-sm text-zinc-500">Showcase your tech stack automatically.</p>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center max-w-xs relative z-10">
            <p className="text-zinc-400 font-medium">
                "Stop learning alone. Start building together."
            </p>
        </div>
      </div>

    </div>
  );
}