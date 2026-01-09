import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordApi } from "../../services/api.auth.js";

// Icons
import { IoArrowBack, IoMail } from "react-icons/io5";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPasswordApi(email);
      toast.success("If an account exists, a reset link has been sent!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-zinc-100 px-4 selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative">
        
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-indigo-500/20">
                <IoMail size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">Forgot Password?</h1>
            <p className="text-zinc-500 text-sm">
                No worries, we'll send you reset instructions.
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">Email Address</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <IoMail />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-12 pl-11 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
            <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
            >
                <IoArrowBack /> Back to Login
            </Link>
        </div>

      </div>
    </div>
  );
}