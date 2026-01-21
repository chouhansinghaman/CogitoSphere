import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import GridGlitchGame from "../../components/GridGlitchGame";
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
  const shouldDisplayGridGlitchGame = useMinimumLoadingTime(
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
        toast.error(err.response.data.message || "Registration failed");
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
  if (shouldDisplayGridGlitchGame) return <GridGlitchGame />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#FDF6E3] text-gray-900 selection:bg-indigo-500/30">
      
      {/* --- LEFT PANEL: FORM --- */}
      <div className="relative flex flex-col justify-center items-center px-8 py-12 order-2 lg:order-1">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-bold"
        >
          <IoArrowBack /> Back to Home
        </button>

        <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Claim your ID.</h1>
            <p className="text-gray-500 font-bold text-sm">
              Join the guild. Start shipping.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiHash />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="dev_alex"
                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Chen"
                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
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

            {/* Row 2: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Password</label>
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
                    className="w-full h-12 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-lg hover:scale-110 transition-transform text-gray-400 hover:text-gray-600"
                    role="button"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all font-medium"
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-lg hover:scale-110 transition-transform text-gray-400 hover:text-gray-600"
                    role="button"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isApiLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {isApiLoading ? "Generating ID..." : "Start Journey"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8 font-medium">
            Already part of the squad?{" "}
            <button onClick={handleSwitchToLogin} className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors">
              Log In
            </button>
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: BENTO GRID --- */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-white p-12 border-l border-gray-100 relative overflow-hidden order-1 lg:order-2">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>

        <div className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10">
            {/* Card 1: Community */}
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl">
                 <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500 mb-4 border border-green-100">
                    <IoChatbubbles size={20} />
                </div>
                 <h3 className="text-lg font-bold text-gray-900 mb-1">Global Chat.</h3>
                 <p className="text-xs text-gray-500 font-medium">Connect with builders.</p>
            </div>

            {/* Card 2: Leaderboard */}
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col justify-between text-center">
                <IoTrophy className="text-yellow-500 text-3xl mb-2 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Rank Up.</h3>
                  <p className="text-xs text-gray-500">Earn badges & XP.</p>
                </div>
            </div>

            {/* Card 3: Profile */}
            <div className="col-span-2 bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-100 flex-shrink-0">
                    <IoPerson size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Dev Profile</h3>
                    <p className="text-sm text-gray-500">Showcase your tech stack automatically.</p>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center max-w-xs relative z-10">
            <p className="text-gray-400 font-medium italic">
                "Stop learning alone. Start building together."
            </p>
        </div>
      </div>

    </div>
  );
}