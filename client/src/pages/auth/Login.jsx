import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Sidebar from "../../components/Sidebar";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSwitch = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/register");
      setLoading(false);
    }, 800);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Welcome back!");
      setLoggedIn(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loggedIn || user) {
    return <Sidebar nav={navigate} />;
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-10">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-600 text-sm">
            Simplify your workflow and boost your productivity with <b>ScholarSphere</b>.
            Get started for free.
          </p>

          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 cursor-pointer text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <Link to="/forgot" className="text-gray-500 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button className="w-full bg-black text-white rounded-full py-2">
            Login
          </button>

          <p className="text-sm text-center">
            Not a member?{" "}
            <button onClick={handleSwitch} className="text-green-600 hover:underline">
              Register now
            </button>
          </p>
        </form>
      </div>

      {/* Right: Illustration */}
      <div className="flex flex-col items-center justify-center bg-black text-white p-10 rounded-l-3xl">
        <img
          src="/images/login-illustration.jpg"
          alt="Illustration"
          className="rounded-xl mb-6"
        />
        <p className="text-center text-lg">
          Make your work easier and organized with <b>ScholarSphere</b>
        </p>
      </div>
    </div>
  );
}
