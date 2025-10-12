import React from 'react';

// This component uses Tailwind CSS classes for layout and embedded CSS
// for the "drawing" animation effect.

export default function Loader() {
  return (
    // Style block defines the "draw" animation for the SVG paths
    <style>
      {`
        /* Define the keyframes for the drawing animation */
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Apply the drawing effect to all paths and circles within the loader SVG */
        .loader-svg path, .loader-svg circle {
          stroke-dasharray: 1500; /* Set a large dash array */
          stroke-dashoffset: 1500; /* Start with the dash offset equal to the array length (hiding the path) */
          animation: draw 2s ease-in-out forwards; /* Apply the animation */
        }

        /* Staggered timing to create the sequential drawing effect */
        /* 1. Cap Top */
        #path-1 { animation-delay: 0s; } 
        /* 2. Cap Base */
        #path-2, #path-3, #path-4, #path-5 { animation-delay: 0.2s; }
        /* 3. Tassel */
        #path-6, #path-7 { animation-delay: 0.6s; }
        /* 4. Diploma */
        #path-8, #path-9, #path-10, #path-11 { animation-delay: 0.8s; }
        /* 5. Ribbon */
        #path-12 { animation-delay: 1.2s; }
      `}
    </style>
    ,
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <svg
        className="loader-svg h-32 w-32 md:h-40 md:w-40"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g>
          {/* --------------------------- Cap Section --------------------------- */}
          {/* Cap Top (Diamond perspective) */}
          <path id="path-1" d="M50 15 L90 35 L50 55 L10 35 Z" />

          {/* Cap Base (Tighter rectangular body underneath the diamond) */}
          <path id="path-2" d="M20 45 H80" /> {/* Top line of the visible body */}
          <path id="path-3" d="M20 45 V 65" /> {/* Left side */}
          <path id="path-4" d="M80 45 V 65" /> {/* Right side */}
          <path id="path-5" d="M20 65 H80" /> {/* Bottom line of the visible body (straight line) */}

          {/* --------------------------- Tassel Section --------------------------- */}
          {/* Tassel: starts from the corner of the diamond, hanging down the side */}
          <path id="path-6" d="M90 35 V 70" />
          <circle id="path-7" cx="90" cy="74" r="4" /> {/* Larger circle for clear line-art look */}

          {/* --------------------------- Diploma & Ribbon Section --------------------------- */}
          {/* Diploma Scroll Body */}
          <path id="path-8" d="M10 75 H90" />
          <path id="path-9" d="M10 90 H90" />
          
          {/* Diploma Scroll Ends (Rolled-up visual effect) */}
          <path id="path-10" d="M10 75 C 5 77.5 5 87.5 10 90" />
          <path id="path-11" d="M90 75 C 95 77.5 95 87.5 90 90" />
          
          {/* Ribbon over the diploma (V-cut bottom) - Starts from under the cap base, over the diploma */}
          {/* Adjusted to be longer and more prominent */}
          <path id="path-12" d="M45 65 V 95 L50 100 L55 95 V 65" />
        </g>
      </svg>
    </div>
  );
}
