import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { loginApi } from "../../services/api.auth.js"; 
import Loader from "../../components/Loader";
import { useMinimumLoadingTime } from "../../hooks/useMinimumLoadingTime";

// Icons
import { IoRocket, IoShieldCheckmark, IoArrowBack } from "react-icons/io5";
import { FiLock, FiMail } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Reduced wait time to 500ms
  const shouldDisplayLoader = useMinimumLoadingTime(
    isApiLoading || isTransitioning,
    500
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsApiLoading(true);
    try {
      const res = await loginApi(formData.email, formData.password);
      login(res.data.token, res.data.user);
      toast.success("Login successful! Welcome back.");
      
      // Force hard redirect
      window.location.href = "/home";
      
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
      setIsApiLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    setIsTransitioning(true);
    setTimeout(() => navigate("/register"), 500);
  };

  if (shouldDisplayLoader) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#050505] text-zinc-100 selection:bg-indigo-500/30">
      
      {/* --- LEFT PANEL: FORM --- */}
      <div className="relative flex flex-col justify-center items-center px-8 py-12">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold"
        >
          <IoArrowBack /> Back to Home
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2 text-white">Welcome back.</h1>
            <p className="text-zinc-500 font-medium">
              Log in to access your dashboard and continue building.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
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

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Password</label>
                <Link to="/forgot" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Forgot?</Link>
              </div>
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
                  className="w-full h-12 pl-11 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                  required
                />
                
                {/* --- RESTORED: Monkey/Eye Icon Toggle --- */}
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 cursor-pointer text-xl select-none hover:scale-110 transition-transform"
                    role="button"
                    title={showPassword ? "Hide Password" : "Show Password"}
                >
                    {showPassword ? "🙈" : "👁️"}
                </span>

              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isApiLoading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center text-zinc-500 mt-8 font-medium">
            New here?{" "}
            <button
              onClick={handleSwitchToRegister}
              className="text-white hover:text-indigo-400 font-bold transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: BENTO FEATURE GRID (Replaces Slider) --- */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#0A0A0A] p-12 border-l border-white/5 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10">
            {/* Card 1 */}
            <div className="col-span-2 bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                    <IoRocket size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Ship Faster.</h3>
                <p className="text-sm text-zinc-500">Join teams, find projects, and deploy your ideas instantly.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                 <h3 className="text-2xl font-black text-white mb-1">10k+</h3>
                 <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Builders</p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
                <IoShieldCheckmark className="text-green-500 text-2xl mb-2" />
                <p className="text-xs text-zinc-400 font-medium">Verified Skills Only.</p>
            </div>
        </div>

        <div className="mt-12 text-center max-w-xs relative z-10">
            <p className="text-zinc-400 font-medium">
                "The only social OS built specifically for students who code."
            </p>
        </div>
      </div>
    </div>
  );
}