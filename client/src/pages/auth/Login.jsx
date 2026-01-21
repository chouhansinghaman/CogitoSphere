import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { loginApi } from "../../services/api.auth.js"; 
import GridGlitchGame from "../../components/GridGlitchGame";
import { useMinimumLoadingTime } from "../../hooks/useMinimumLoadingTime";

// Icons
import { IoRocket, IoShieldCheckmark, IoArrowBack } from "react-icons/io5";
import { FiLock, FiMail, FiCpu } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Reduced wait time to 500ms
  const shouldDisplayGridGlitchGame = useMinimumLoadingTime(
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
      
      // Force hard redirect to ensure clean state load
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

  if (shouldDisplayGridGlitchGame) return <GridGlitchGame />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#FDF6E3] text-gray-900 selection:bg-indigo-500/30">
      
      {/* --- LEFT PANEL: FORM --- */}
      <div className="relative flex flex-col justify-center items-center px-8 py-12">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-bold"
        >
          <IoArrowBack /> Back to Home
        </button>

        <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mb-4 text-2xl shadow-sm">
                <FiCpu />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Welcome back.</h1>
            <p className="text-gray-500 font-bold text-sm">
              Log in to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Password</label>
                <Link to="/forgot" className="text-xs text-indigo-600 hover:text-indigo-500 font-bold">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                  required
                />
                
                {/* Eye Icon Toggle */}
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 cursor-pointer text-lg select-none hover:scale-110 transition-transform text-gray-400 hover:text-gray-600"
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isApiLoading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8 font-medium">
            New here?{" "}
            <button
              onClick={handleSwitchToRegister}
              className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: BENTO FEATURE GRID (Light Theme) --- */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-white p-12 border-l border-gray-100 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>

        <div className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10">
            {/* Card 1 */}
            <div className="col-span-2 bg-white border border-gray-100 shadow-sm p-6 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100">
                    <IoRocket size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ship Faster.</h3>
                <p className="text-sm text-gray-500">Join teams, find projects, and deploy your ideas instantly.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl text-center">
                 <h3 className="text-3xl font-black text-gray-900 mb-1">10k+</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Builders</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <IoShieldCheckmark className="text-green-500 text-3xl mb-2" />
                <p className="text-xs text-gray-500 font-bold">Verified Skills.</p>
            </div>
        </div>

        <div className="mt-12 text-center max-w-xs relative z-10">
            <p className="text-gray-400 font-medium italic">
                "The only social OS built specifically for students who code."
            </p>
        </div>
      </div>
    </div>
  );
}