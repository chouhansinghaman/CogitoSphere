import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const Loader = () => {
  const [message, setMessage] = useState("Establishing Link");
  const [subMessage, setSubMessage] = useState("Encrypting connection...");

  useEffect(() => {
    // Timer 1: After 3 seconds (Standard load time passed)
    const timer1 = setTimeout(() => {
      setMessage("Waking up Server");
      setSubMessage("This might take a moment...");
    }, 3500);

    // Timer 2: After 10 seconds (Render/Railway cold start)
    const timer2 = setTimeout(() => {
      setMessage("Still Connecting");
      setSubMessage("Spinning up backend dynos...");
    }, 10000);

    // Timer 3: After 20 seconds (Taking a while)
    const timer3 = setTimeout(() => {
      setMessage("Almost There");
      setSubMessage("Thank you for your patience.");
    }, 20000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-zinc-100 font-sans">

      {/* --- CSS STYLES FOR ANIMATIONS --- */}
      <style>{`
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes progress-slide {
          0% { left: -50%; width: 50%; }
          50% { width: 30%; }
          100% { left: 100%; width: 50%; }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        .animate-scan {
          animation: scan-line 2s linear infinite;
        }
        .animate-progress {
          animation: progress-slide 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      ></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none"></div>

      <div className="relative">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse"></div>

        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full border border-white/5 border-t-indigo-500 animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>

        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full border border-white/5 border-b-cyan-500 animate-spin-reverse"></div>

        {/* Center Box */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-black rounded-lg border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500 animate-scan"></div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="rounded-sm w-8 h-8 object-cover shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Loading Text */}
      <div className="mt-10 flex flex-col items-center z-10 text-center px-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse transition-all duration-500">
          {message}
        </h2>
        <p className="text-[10px] text-zinc-600 font-medium mt-2 tracking-widest uppercase">
            {subMessage}
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-32 h-1 bg-zinc-900 rounded-full overflow-hidden relative border border-white/5">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-cyan-500 h-full animate-progress"></div>
        </div>
      </div>

    </div>
  );
};

export default Loader;