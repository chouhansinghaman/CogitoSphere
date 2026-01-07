import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      {/* Injecting custom keyframes for specific rotations not standard in Tailwind 
      */}
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          /* Custom classes using the keyframes */
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 1.5s linear infinite;
          }
        `}
      </style>

      {/* Loader Container */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        
        {/* 1. Outer Glowing Ring (Blue/Cyan) - Slow spin */}
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-cyan-400 border-r-cyan-400 opacity-80 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-spin-slow"></div>

        {/* 2. Inner Ring (Purple/Violet) - Fast reverse spin */}
        <div className="absolute h-16 w-16 rounded-full border-[4px] border-transparent border-b-violet-500 border-l-violet-500 opacity-90 animate-spin-reverse"></div>

        {/* 3. Center Core - Pulsing Dot */}
        <div className="absolute h-4 w-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse"></div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 text-lg font-medium tracking-widest text-cyan-100/80 animate-pulse">
        LOADING
      </div>
    </div>
  );
}