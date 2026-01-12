import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoKey, IoCheckmarkCircle } from "react-icons/io5";

export default function ResetPassword() {
  // ✅ FIX: Use searchParams to get data from the ?email=...&code=... link
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailFromUrl = searchParams.get("email");
  const codeFromUrl = searchParams.get("code");

  // State
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Optional: Redirect if the link is broken (missing email/code)
  useEffect(() => {
    if (!emailFromUrl || !codeFromUrl) {
      toast.error("Invalid reset link.");
      navigate("/login");
    }
  }, [emailFromUrl, codeFromUrl, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ FIX: Send data in the BODY, not the URL
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailFromUrl, 
          code: codeFromUrl, 
          newPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password successfully reset! Please login.");
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-zinc-100 px-4 selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-indigo-500/20">
                <IoKey size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">Set New Password</h1>
            <p className="text-zinc-500 text-sm">
                for {emailFromUrl || "your account"}
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider ml-1">New Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <IoKey />
                </div>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-11 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-zinc-600 transition-all"
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Resetting..." : (
                <>
                    <IoCheckmarkCircle className="text-xl" /> Reset Password
                </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}