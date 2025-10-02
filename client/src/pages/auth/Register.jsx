import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useMinimumLoadingTime } from "../../hooks/useMinimumLoadingTime";
import Logo from "../../assets/logo.png";
import Illustration from "../../assets/illustration.PNG";
import { registerApi, loginApi } from "../../services/api.auth.js"; // ✅ helpers

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

  const shouldDisplayLoader = useMinimumLoadingTime(
    isApiLoading || isTransitioning,
    3000
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

      await registerApi(apiData); // ✅ register helper

      const loginRes = await loginApi(formData.email, formData.password); // ✅ login helper
      login(loginRes.data.token, loginRes.data.user);

      toast.success("Account created! Welcome!");
      navigate("/home");
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
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  if (user) return null; // Keep your Sidebar or redirect logic
  if (shouldDisplayLoader) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[35%_65%] font-poppins">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-black text-white relative">
        <div className="absolute top-6 left-6 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
          <img src={Logo} alt="ScholarSphere Logo" className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="w-[80%] h-100 bg-gray-800 rounded-lg flex items-center justify-center">
          <img src={Illustration} alt="ScholarSphere Illustration" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center px-6 md:px-12 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-snug">
            Join us for an <br /> amazing journey!
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="peer h-12 w-full border border-gray-300 rounded-lg px-4 placeholder-transparent focus:outline-none focus:border-black"
                  required
                />
                <label htmlFor="username" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black">
                  Username
                </label>
              </div>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="peer h-12 w-full border border-gray-300 rounded-lg px-4 placeholder-transparent focus:outline-none focus:border-black"
                  required
                />
                <label htmlFor="name" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black">
                  Name
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="peer h-12 w-full border border-gray-300 rounded-lg px-4 placeholder-transparent focus:outline-none focus:border-black"
                required
              />
              <label htmlFor="email" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black">
                Email
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="peer h-12 w-full border border-gray-300 rounded-lg px-4 placeholder-transparent focus:outline-none focus:border-black"
                  required
                />
                <label htmlFor="password" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black">
                  Password
                </label>
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 cursor-pointer text-gray-500">
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="peer h-12 w-full border border-gray-300 rounded-lg px-4 placeholder-transparent focus:outline-none focus:border-black"
                  required
                />
                <label htmlFor="confirmPassword" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black">
                  Confirm Password
                </label>
                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 cursor-pointer text-gray-500">
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button type="submit" disabled={isApiLoading} className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-75">
              {isApiLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <button onClick={handleSwitchToLogin} className="text-green-500 font-medium hover:underline">
              Login now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
