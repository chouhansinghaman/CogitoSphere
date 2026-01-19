import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const Loader = () => {
  const [message, setMessage] = useState("Establishing Link");
  const [subMessage, setSubMessage] = useState("Encrypting connection...");

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setMessage("Waking up Server");
      setSubMessage("This might take a moment...");
    }, 3500);

    const timer2 = setTimeout(() => {
      setMessage("Still Connecting");
      setSubMessage("Spinning up backend dynos...");
    }, 10000);

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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDF6E3] text-[#5C4033] font-sans">

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

      {/* Background Grid (Darker dots on Cream bg) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#5C4033 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      ></div>

      {/* Vignette (Cream fade) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDF6E3_100%)] pointer-events-none"></div>

      <div className="relative">
        {/* Glow Background (Subtle Indigo) */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full animate-pulse"></div>

        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full border-2 border-[#EED9C4] border-t-indigo-600 animate-spin shadow-sm"></div>

        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-[#EED9C4] border-b-[#E76F51] animate-spin-reverse"></div>

        {/* Center Box */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-xl border-2 border-[#EED9C4] flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500 animate-scan"></div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="rounded-sm w-8 h-8 object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Loading Text */}
      <div className="mt-10 flex flex-col items-center z-10 text-center px-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#5C4033] animate-pulse transition-all duration-500">
          {message}
        </h2>
        <p className="text-[10px] text-[#A68A7C] font-bold mt-2 tracking-widest uppercase">
            {subMessage}
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-32 h-1.5 bg-[#EED9C4] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-[#E76F51] h-full animate-progress"></div>
        </div>
      </div>

    </div>
  );
};

export default Loader;