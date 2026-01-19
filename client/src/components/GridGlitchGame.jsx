import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiCheck, FiArrowRight, FiZap } from "react-icons/fi";
import { FaCookieBite, FaMugHot } from "react-icons/fa";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- STYLES ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- FLOATING BACKGROUND PARTICLES ---
const BackgroundParticles = () => {
  const items = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: Math.random() * 90,
    top: Math.random() * 90,
    duration: 15 + Math.random() * 10, 
    delay: Math.random() * 5,
    icon: i % 3 === 0 ? "🍪" : i % 3 === 1 ? "☕" : "✨",
    size: 20 + Math.random() * 30,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute opacity-10 blur-[1px]" 
          style={{ 
            left: `${item.left}%`, 
            top: `${item.top}%`, 
            fontSize: item.size 
          }}
          animate={{
            y: [0, -50], 
            rotate: [0, 20], 
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            repeatType: "mirror", 
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};

const GridGlitchGame = ({ isServerReady = false, onEnterApp }) => {
  const [gameState, setGameState] = useState("idle");
  const [activeSlot, setActiveSlot] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [wobble, setWobble] = useState(false);
  const [shakeGrid, setShakeGrid] = useState(false); 
  const [popups, setPopups] = useState([]); 
  
  const timerRef = useRef(null);
  const visibilityRef = useRef(null);
  const popupIdRef = useRef(0);

  // --- GAME LOGIC ---
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setCombo(1);
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnTarget = () => {
      const newSlot = Math.floor(Math.random() * 9);
      setActiveSlot(newSlot);

      // ⏱️ CHANGED: Cookie stays visible for 2000ms (2 seconds)
      visibilityRef.current = setTimeout(() => {
        setActiveSlot(null);
        setCombo(1); 
      }, 2000); 
    };

    // ⏱️ CHANGED: Spawn a new one every 2300ms (relaxed pace)
    timerRef.current = setInterval(spawnTarget, 2300);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(visibilityRef.current);
    };
  }, [gameState]);

  const triggerPopup = (x, y, text) => {
    const id = popupIdRef.current++;
    setPopups((prev) => [...prev, { id, x, y, text }]);
    // ⏱️ CHANGED: Text stays in DOM longer before cleanup
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1500); 
  };

  const handleSlotClick = (index, e) => {
    if (gameState !== "playing") return;

    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    if (index === activeSlot) {
      // Hit!
      const points = 10 * combo;
      setScore((prev) => prev + points);
      setCombo((prev) => Math.min(prev + 1, 8));
      setActiveSlot(null);
      clearTimeout(visibilityRef.current);
      
      setWobble(true);
      setTimeout(() => setWobble(false), 200);
      
      const words = ["YUM!", "CRUNCH!", "TASTY!", "SWEET!", "WOW!"];
      const randomWord = words[Math.floor(Math.random() * words.length)];
      triggerPopup(x, y, randomWord);

    } else {
      // Miss
      setCombo(1);
      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 300);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-[#FDF6E3] flex flex-col items-center justify-center relative overflow-hidden text-[#5C4033] py-12"
         style={{ fontFamily: "'Fredoka', sans-serif" }}>
        
        {/* 🎨 Background Texture */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
                 backgroundImage: `linear-gradient(#5C4033 1px, transparent 1px), linear-gradient(90deg, #5C4033 1px, transparent 1px)`, 
                 backgroundSize: '40px 40px' 
             }}>
        </div>

        {/* ✨ Background Particles */}
        <BackgroundParticles />

        {/* 📺 CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.04] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/HDRI_Sample_Scene_Balls_%28JPEG-HDR%29.jpg/1200px-HDRI_Sample_Scene_Balls_%28JPEG-HDR%29.jpg')] bg-cover mix-blend-overlay"></div>

        {/* 🗯️ POPUP TEXT CONTAINER (Overlay) */}
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <AnimatePresence>
                {popups.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: p.y, x: p.x, scale: 0.5 }}
                        // ✨ CHANGED: Slower animation (duration: 1.2), less distance (-60)
                        animate={{ opacity: [0, 1, 1, 0], y: p.y - 60, scale: 1.1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute text-[#E76F51] font-black text-2xl drop-shadow-md whitespace-nowrap"
                        style={{ left: 0, top: 0 }} 
                    >
                        {p.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* 📦 MAIN GAME CARD */}
        <div className={cn(
            "relative flex flex-col items-center justify-center w-full max-w-[380px] p-6 rounded-[2.5rem] transition-all duration-300 z-10",
            "bg-[#FFF8E7] border-[6px] border-[#5C4033]",
            "shadow-[12px_12px_0px_0px_rgba(92,64,51,0.3)]", 
            wobble ? "scale-[1.02] rotate-1" : "scale-100"
        )}>
            
            {/* 🏷️ TOP BADGE */}
            <div className="absolute -top-8 bg-[#5C4033] text-[#FFF8E7] py-2 px-6 rounded-2xl font-black tracking-wider shadow-lg transform -rotate-2 border-4 border-[#FFF8E7] flex items-center gap-2">
                {isServerReady ? <FiCheck className="text-[#2A9D8F]" /> : <FaMugHot className="text-[#E76F51] animate-pulse" />}
                <span>{isServerReady ? "SYSTEM ONLINE" : "BREWING..."}</span>
            </div>
            
            {/* --- LOADING BAR --- */}
            <div className="w-full mt-6 mb-6">
                 <div className="flex justify-between text-sm font-bold opacity-70 mb-1 px-1">
                    <span>Server Load</span>
                    <span>{isServerReady ? "100%" : "45%"}</span>
                 </div>
                 <div className="w-full h-5 bg-[#E6CDB3] rounded-full border-2 border-[#5C4033] overflow-hidden relative shadow-inner">
                    <motion.div 
                        initial={{ width: "5%" }}
                        animate={{ width: isServerReady ? "100%" : "45%" }}
                        className={cn(
                            "h-full relative",
                            isServerReady ? "bg-[#2A9D8F]" : "bg-[#E76F51]"
                        )}
                    >
                        <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
                    </motion.div>
                 </div>
            </div>

            {/* --- SCREEN 1: IDLE --- */}
            {gameState === "idle" && (
                <div className="h-[300px] w-full flex flex-col items-center justify-center space-y-6 bg-[#EED9C4]/30 rounded-3xl border-2 border-[#E6CDB3] border-dashed p-4">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="relative"
                    >
                         <div className="absolute inset-0 bg-[#E76F51] blur-xl opacity-30 rounded-full"></div>
                         <FaCookieBite className="text-8xl text-[#8D6E63] relative z-10 drop-shadow-md" />
                    </motion.div>
                    
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-[#5C4033]">Cookie Clicker</h3>
                        <p className="text-[#8D7B68] font-semibold text-sm mt-1">
                            Wait for the server in style!
                        </p>
                    </div>

                    <button 
                        onClick={startGame}
                        className="w-full bg-[#5C4033] hover:bg-[#4A332A] text-[#FFF8E7] text-xl font-bold py-3 rounded-xl shadow-[0px_4px_0px_0px_#2E201B] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 group"
                    >
                        <FiPlay className="group-hover:fill-current" /> PLAY
                    </button>
                </div>
            )}

            {/* --- SCREEN 2: GAME --- */}
            {gameState === "playing" && (
                <div className="w-full">
                    {/* Score Panel */}
                    <div className="flex items-center justify-between bg-[#5C4033] rounded-2xl p-3 mb-4 shadow-md text-[#FFF8E7]">
                        <div className="flex flex-col px-2">
                             <span className="text-[10px] uppercase font-bold text-[#D4A373]">Score</span>
                             <motion.span 
                                key={score}
                                initial={{ scale: 1.5, color: "#E76F51" }}
                                animate={{ scale: 1, color: "#FFF8E7" }}
                                className="text-2xl font-black leading-none"
                             >
                                {score}
                             </motion.span>
                        </div>
                        <div className="flex flex-col items-end px-2 border-l border-[#785E54]">
                             <span className="text-[10px] uppercase font-bold text-[#D4A373]">Combo</span>
                             <div className="flex items-center gap-1">
                                <span className="text-xl font-black leading-none text-[#E9C46A]">x{combo}</span>
                                {combo > 1 && <FiZap className="text-yellow-400 animate-bounce" />}
                             </div>
                        </div>
                    </div>

                    {/* The Grid */}
                    <motion.div 
                        animate={shakeGrid ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-3 gap-3 w-full bg-[#D4A373] p-3 rounded-3xl border-b-8 border-[#A68A7C]"
                    >
                        {Array.from({ length: 9 }).map((_, index) => {
                        const isActive = index === activeSlot;
                        
                        return (
                            <motion.div
                            key={index}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleSlotClick(index, e)}
                            className={cn(
                                "aspect-square rounded-2xl relative cursor-pointer overflow-hidden",
                                "bg-[#FFF8E7] shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.1)]",
                                isActive ? "bg-[#FFE8D6]" : "hover:bg-white"
                            )}
                            >
                                {/* Waffle Pattern */}
                                <div className="absolute inset-0 opacity-10" 
                                     style={{backgroundImage: 'radial-gradient(#5C4033 20%, transparent 20%)', backgroundSize: '8px 8px'}}>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                        className="absolute inset-0 flex items-center justify-center z-20"
                                    >
                                        <FaCookieBite className="text-5xl text-[#5C4033] drop-shadow-md relative z-10" />
                                        
                                        {/* 🕐 UPDATED TIMER: Dur="2s" to match new logic */}
                                        <svg className="absolute w-[60px] h-[60px] -rotate-90 z-0">
                                            <circle cx="30" cy="30" r="26" stroke="#E6CDB3" strokeWidth="3" fill="transparent" />
                                            <circle cx="30" cy="30" r="26" stroke="#E76F51" strokeWidth="3" fill="transparent" strokeDasharray="164" strokeDashoffset="0" strokeLinecap="round">
                                                <animate attributeName="stroke-dashoffset" from="0" to="164" dur="2s" fill="freeze" />
                                            </circle>
                                        </svg>
                                    </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                        })}
                    </motion.div>
                </div>
            )}
        </div>

        {/* 🚀 LAUNCH BUTTON */}
        <div className="h-24 flex items-center justify-center w-full z-20 mt-4">
            <AnimatePresence>
                {isServerReady && (
                    <motion.button
                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnterApp}
                        className={cn(
                            "relative group bg-[#2A9D8F] text-white font-black py-4 px-10 text-xl rounded-full shadow-2xl flex items-center gap-4 overflow-hidden",
                            "border-b-8 border-[#1D7066] active:border-b-0 active:translate-y-2 transition-all"
                        )}
                    >
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full blur-sm"></div>
                        <span className="relative z-10 drop-shadow-md">ENTER APP</span>
                        <div className="bg-[#1D7066] p-2 rounded-full relative z-10 group-hover:translate-x-1 transition-transform">
                            <FiArrowRight size={24} />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>

        <div className="absolute bottom-4 text-[#5C4033] opacity-40 text-xs font-bold tracking-widest mix-blend-multiply">
            DESIGNED FOR COFFEE BREAKS
        </div>
    </div>
  );
};

export default GridGlitchGame;