import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { loginApi } from "../../services/api.auth.js"; 
import Loader from "../../components/Loader";
import { useMinimumLoadingTime } from "../../hooks/useMinimumLoadingTime";

// Slider images
import Illustration1 from "../../assets/illus-1.PNG";
import Illustration2 from "../../assets/illus-2.PNG";
import Illustration3 from "../../assets/illus-3.PNG";

const sliderImages = [Illustration1, Illustration2, Illustration3];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const shouldDisplayLoader = useMinimumLoadingTime(
    isApiLoading || isTransitioning,
    3000
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
      // ✅ Removed duplicate declaration
      const res = await loginApi(formData.email, formData.password);
      login(res.data.token, res.data.user);
      toast.success("Login successful! Welcome back.");
      navigate("/home");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    setIsTransitioning(true);
    setTimeout(() => navigate("/register"), 3000);
  };

  if (shouldDisplayLoader) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
      {/* Left Panel */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-500 mb-8">
            Simplify your workflow and boost your productivity with ScholarSphere.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="peer w-full h-14 px-6 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black placeholder-transparent transition"
                required
              />
              <label
                htmlFor="email"
                className="absolute left-6 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
              >
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="peer w-full h-14 px-6 pr-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black placeholder-transparent transition"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-6 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
              >
                Password
              </label>
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-3.5 cursor-pointer text-xl select-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="text-right -mt-2">
              <Link
                to="/forgot"
                className="text-sm font-medium text-gray-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-75"
            >
              {isApiLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Not a member?{" "}
            <button
              onClick={handleSwitchToRegister}
              className="text-green-500 font-medium hover:underline"
            >
              Register now
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel: Slider */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-black p-10 text-white text-center relative overflow-hidden">
        <div className="w-full max-w-md h-[60vh] relative">
          {sliderImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slider image ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <div className="flex space-x-2 mt-8">
          {sliderImages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
        <p className="mt-6 text-lg max-w-xs">
          Make your work easier and organized with{" "}
          <span className="font-bold">ScholarSphere</span>
        </p>
      </div>
    </div>
  );
}
