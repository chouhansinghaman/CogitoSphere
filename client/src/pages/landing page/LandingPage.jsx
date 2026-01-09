import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader"; 
import logo from "../../assets/logo.png";

import { 
  IoRocket, IoCodeSlash, IoChatbubbles, IoFlame, 
  IoTrophy, IoNotifications, IoSettings, IoLibrary, IoClose, IoHeart 
} from "react-icons/io5";
import { 
  FiUsers, FiArrowRight, FiCommand, FiActivity, FiShield, FiCheckCircle 
} from "react-icons/fi";

/* --- 1. ANIMATION WRAPPER --- */
const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-12 scale-95 blur-sm"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* --- 2. BACKGROUND COMPONENT --- */
const PaperGalaxyBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px', 
          animation: 'paperDrift 60s linear infinite',
        }}
      ></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none"></div>
      <style>{`
        @keyframes paperDrift { 
          0% { background-position: 0 0; } 
          100% { background-position: -64px -64px; } 
        }
      `}</style>
    </div>
  );
};

/* --- 3. PRIVACY MODAL --- */
const PrivacyModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <IoClose size={24} />
        </button>
        
        <div className="flex items-center gap-2 mb-6 text-indigo-400">
            <FiShield size={24} />
            <h2 className="text-xl font-bold text-white">House Rules & Privacy</h2>
        </div>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
            <div>
                <h3 className="text-white font-bold mb-2">1. Data We Collect</h3>
                <p>We keep it simple. We only store your <span className="text-zinc-200">Name</span> and <span className="text-zinc-200">Email</span> to identify you. That's it.</p>
            </div>
            
            <div>
                <h3 className="text-white font-bold mb-2">2. Security</h3>
                <p>Your passwords are <span className="text-zinc-200">hashed and salted</span> immediately. We cannot see your password, and neither can anyone else.</p>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h3 className="text-red-400 font-bold mb-2">3. Code of Conduct</h3>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Be respectful. This is a community for builders.</li>
                    <li>Zero tolerance for hate speech, slang, or toxicity.</li>
                    <li>Harassment results in an immediate, permanent ban.</li>
                </ul>
            </div>
        </div>

        <button onClick={onAccept} className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors">
            Understood
        </button>
      </div>
    </div>
  );
};

/* --- 4. CELEBRATION MODAL --- */
const CelebrationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 w-full max-w-md rounded-3xl p-8 relative shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-in zoom-in-90 duration-300 text-center">
          
          <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_#6366f1] animate-bounce">
             <IoHeart className="text-white text-4xl" />
          </div>

          <h2 className="text-3xl font-black text-white mb-3">Welcome to the Guild.</h2>
          <p className="text-indigo-200 text-lg mb-8">
            We're proud to have you. <br/>
            Let's build something incredible together.
          </p>

          <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/40">
            Let's Go! 🚀
          </button>
       </div>
    </div>
  );
};

/* --- 5. MAIN PAGE --- */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handlePrivacyAccept = () => {
    setShowPrivacy(false);
    // Slight delay to make it feel like a transition
    setTimeout(() => setShowCelebration(true), 300);
  };

  const scrollToWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <Loader />;

  return (
    <div className="relative min-h-screen font-sans text-zinc-100 overflow-x-hidden selection:bg-indigo-500/30">
      
      <PaperGalaxyBackground />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} onAccept={handlePrivacyAccept} />
      <CelebrationModal isOpen={showCelebration} onClose={() => setShowCelebration(false)} />

      {/* --- NAV --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
             <img src={logo} alt="CogitoSphere Logo" className="rounded-lg w-8 h-8 object-cover shadow-[0_0_15px_rgba(99,102,241,0.5)]"/>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">CogitoSphere</span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Log In</button>
            <button onClick={() => navigate("/register")} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Get Started</button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="px-6 pt-32 pb-24 max-w-5xl mx-auto text-center relative">
        <RevealOnScroll>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-indigo-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]"></span>
              Live: Global Chat Lobby
            </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-white drop-shadow-2xl">
              Your Social <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Operating System.
              </span>
            </h1>
        </RevealOnScroll>
        
        <RevealOnScroll delay={200}>
            <p className="text-lg md:text-xl text-zinc-400 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Manage your study streak, find teammates for projects like <span className="text-zinc-200 font-bold">StudentStays</span>, and prove your skills with verifiable quizzes.
            </p>
        </RevealOnScroll>
        
        <RevealOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate("/register")} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-1">
                Create Developer ID <FiArrowRight />
              </button>
              <button onClick={scrollToWorks} className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:-translate-y-1">
                <FiActivity /> See How It Works
              </button>
            </div>
        </RevealOnScroll>
      </header>

      {/* --- BENTO GRID SHOWCASE --- */}
      <section className="px-4 sm:px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 grid-rows-[auto]">
          
          {/* 1. Smart Dashboard */}
          <div className="md:col-span-2 md:row-span-2 h-full">
             <RevealOnScroll className="h-full">
                <div className="bg-zinc-900/40 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors h-full">
                    <div className="relative z-10">
                    <div className="bg-orange-500/20 w-12 h-12 flex items-center justify-center rounded-2xl mb-6 text-orange-400 border border-orange-500/20"><IoFlame size={24} /></div>
                    <h3 className="text-2xl font-bold text-white">Smart Dashboard</h3>
                    <p className="text-zinc-400 mt-2 max-w-sm leading-relaxed">
                        Track your daily study streak with a dynamic counter. Manage interactive learning goals in one view.
                    </p>
                    </div>
                    {/* Visual Mockup - Hidden on tiny mobile screens */}
                    <div className="absolute right-0 bottom-0 w-[60%] h-[60%] bg-[#0A0A0A] border-t border-l border-white/10 rounded-tl-3xl p-6 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 shadow-2xl hidden sm:block">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Daily Streak</span>
                        <span className="text-orange-500 font-black text-xl flex items-center gap-1">12 <IoFlame /></span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-[70%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_orange]"></div>
                        </div>
                        <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30"></div>
                        <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/30"></div>
                        </div>
                    </div>
                    </div>
                </div>
            </RevealOnScroll>
          </div>

          {/* 2. Build Space Hub */}
          <div className="md:col-span-1 md:row-span-2 h-full">
            <RevealOnScroll delay={100} className="h-full">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group h-full">
                    <div className="relative z-10 h-full flex flex-col">
                    <div className="bg-zinc-800/50 w-12 h-12 flex items-center justify-center rounded-2xl mb-6 text-white border border-white/10"><IoRocket size={24} /></div>
                    <h3 className="text-xl font-bold mb-2 text-white">Build Space</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                        Post ideas like <span className="text-white font-semibold">StudentStays</span>. Create teams instantly.
                    </p>
                    
                    <div className="mt-auto space-y-3">
                        <div className="bg-zinc-900/80 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">JD</div>
                        <div className="text-xs">
                            <div className="font-bold text-white">Joined Team</div>
                            <div className="text-zinc-500">Just now</div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </RevealOnScroll>
          </div>

          {/* 3. Global Chat */}
          <div className="md:col-span-1">
             <RevealOnScroll delay={200}>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-6 relative overflow-hidden text-white group shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] transition-transform">
                    <div className="relative z-10">
                    <IoChatbubbles className="text-3xl mb-3 text-indigo-200" />
                    <h3 className="font-bold text-lg">Global Chat</h3>
                    <p className="text-indigo-100 text-xs mt-2 font-medium">Real-time lobby for all builders.</p>
                    </div>
                </div>
             </RevealOnScroll>
          </div>

          {/* 4. Quizzes */}
          <div className="md:col-span-1">
             <RevealOnScroll delay={250}>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                    <div className="relative z-10">
                    <IoCodeSlash className="text-3xl mb-3 text-green-400" />
                    <h3 className="font-bold text-lg text-white">Skill Quizzes</h3>
                    <p className="text-zinc-500 text-xs mt-2 font-medium">Verify your stack. Earn badges.</p>
                    </div>
                </div>
             </RevealOnScroll>
          </div>

          {/* 5. Public Digital ID */}
          <div className="md:col-span-2">
            <RevealOnScroll delay={150}>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-zinc-400 mb-4">
                        <FiUsers className="text-indigo-400"/> Public Profile
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Public Digital ID</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Showcase your developer profile, including your GitHub stats, tech stack, and current project status.
                    </p>
                    </div>
                    
                    {/* Profile Card Mockup - Rotates only on Desktop */}
                    <div className="w-full md:w-64 bg-[#0F0F0F] rounded-xl border border-white/10 p-4 shadow-2xl md:rotate-3 md:group-hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">Dev</div>
                        <div>
                        <div className="text-sm font-bold text-white">Alex C.</div>
                        <div className="text-[10px] text-zinc-500">Full Stack • Lvl 5</div>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-[10px] rounded font-bold border border-white/5">React</span>
                        <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-[10px] rounded font-bold border border-white/5">Node</span>
                    </div>
                    </div>
                </div>
            </RevealOnScroll>
          </div>

          {/* 6. Leaderboard */}
          <div className="md:col-span-2">
            <RevealOnScroll delay={200}>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <IoTrophy className="text-yellow-500" /> Leaderboard
                        </h3>
                        <p className="text-zinc-500 text-sm mt-2 max-w-sm">
                        Compare your quiz performance and study streaks against other students.
                        </p>
                    </div>
                    {/* Mini Leaderboard List - Hidden on Mobile */}
                    <div className="hidden md:block w-48 bg-black/40 rounded-xl border border-white/10 p-2 space-y-1">
                        {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${rank === 1 ? 'text-yellow-500' : 'text-zinc-500'}`}>#{rank}</span>
                            <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{9000 - (rank * 400)} XP</span>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="relative py-24 md:py-32 px-6 max-w-7xl mx-auto scroll-mt-20">
        <RevealOnScroll>
            <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                From Zero to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Shipped</span>.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Join the only platform where your code commits turn into social currency.
            </p>
            </div>
        </RevealOnScroll>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-0"></div>

          {/* Steps */}
          {[
            { num: "1", title: "Claim ID", desc: "Sign up and get your automated developer profile." },
            { num: "2", title: "Find Squad", desc: "Browse projects and join a team that needs your stack." },
            { num: "3", title: "Build & Earn", desc: "Ship code in the lobby and unlock exclusive rank badges." }
          ].map((step, idx) => (
            <RevealOnScroll key={idx} delay={idx * 150} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-28 h-28 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-indigo-500/50 transition-all duration-500">
                 <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-2xl font-black text-white border border-white/5">
                   {step.num}
                 </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-zinc-500 leading-relaxed max-w-xs group-hover:text-zinc-300 transition-colors">
                {step.desc}
              </p>
            </RevealOnScroll>
          ))}
        </div>
        
        <RevealOnScroll delay={300}>
            <div className="mt-20 flex justify-center">
                <button onClick={() => navigate("/register")} className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    <span className="relative flex items-center gap-2">Start Your Journey Now <FiArrowRight/></span>
                </button>
            </div>
        </RevealOnScroll>
      </section>

      {/* --- ECOSYSTEM --- */}
      <section className="py-24 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <div className="mb-16">
                <h2 className="text-3xl font-black tracking-tight text-white">Complete Ecosystem.</h2>
                <p className="text-zinc-500 mt-2">Everything you need to manage your builder journey.</p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RevealOnScroll delay={0}>
                <FeatureItem icon={<IoLibrary className="text-purple-400"/>} title="Course Discovery" desc="Explore curated learning paths and detailed curriculum." />
            </RevealOnScroll>
            <RevealOnScroll delay={100}>
                <FeatureItem icon={<FiCommand className="text-red-400"/>} title="Admin Power Suite" desc="Manage the ecosystem by broadcasting announcements." />
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
                <FeatureItem icon={<IoNotifications className="text-blue-400"/>} title="Live Notifications" desc="Instant alerts for project invites and updates." />
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
                <FeatureItem icon={<IoSettings className="text-zinc-400"/>} title="Advanced Settings" desc="Customize your identity and manage security." />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CogitoSphere" className="rounded-lg w-6 h-6 object-cover opacity-80"/>
            <span className="font-bold text-white tracking-tight">CogitoSphere</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium text-center md:text-left">
            © 2026 CogitoSphere. Built for builders.
          </p>
          <div className="flex gap-6 text-sm font-bold text-zinc-500">
            {/* Privacy Trigger */}
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy & Rules</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- HELPER SUB-COMPONENT --- */
const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-start p-4 hover:bg-white/5 transition-all rounded-2xl border border-transparent hover:border-white/10">
    <div className="bg-white/5 border border-white/10 w-10 h-10 flex items-center justify-center rounded-xl mb-4 text-lg">
      {icon}
    </div>
    <h3 className="font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;