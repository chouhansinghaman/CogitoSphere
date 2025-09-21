import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader"; 
import Sidebar from "../../components/Sidebar.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await API.post("/auth/register", formData);

      // auto-login with same credentials
      await login(formData.email, formData.password);

      toast.success("Account created, welcome!");
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // handle switch to login with loader
  const handleSwitchToLogin = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
      setLoading(false);
    }, 800); // splash delay
  };

  // already logged in / registered
  if (registered || user) {
    return <Sidebar nav={navigate} />;
  }

  // loader state
  if (loading) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-red-700">
      {/* Left: Illustration */}
      <div className="hidden md:flex items-center justify-center bg-black text-white p-10">
        <div className="max-w-sm text-center">
          <img
            src="/images/register-illustration.png"
            alt="Illustration"
            className="mb-6"
          />
          <p className="text-lg">
            Join us for an amazing journey with <b>ScholarSphere</b>!
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Join us for an amazing journey!
          </h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-full py-2 hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <button
              onClick={handleSwitchToLogin}
              className="text-green-600 hover:underline"
            >
              Login now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
