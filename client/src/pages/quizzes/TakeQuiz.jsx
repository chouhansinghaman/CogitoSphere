import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiX, FiAlertTriangle, FiArrowLeft, FiLogOut, FiMaximize, FiPlay, FiSettings } from 'react-icons/fi';
import Confetti from 'react-confetti';

// --- CUSTOM HOOK FOR WINDOW SIZE ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });
  useEffect(() => {
    function handleResize() { setWindowSize({ width: window.innerWidth, height: window.innerHeight }); }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

// --- LOADER COMPONENT ---
const CalculatingGridGlitchGame = () => (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
    <div className="relative">
      <div className="w-24 h-24 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold animate-pulse">%</div>
    </div>
    <h2 className="mt-8 text-2xl font-black tracking-widest uppercase animate-pulse">Calculating Score</h2>
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="absolute text-indigo-500 font-mono text-xl animate-bounce"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 3 + 2}s` }}>
          {Math.floor(Math.random() * 100)}
        </div>
      ))}
    </div>
  </div>
);

// --- EXIT CONFIRMATION MODAL ---
const ExitModal = ({ show, onCancel, onSubmit, onLeave }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-zinc-200">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><FiAlertTriangle size={32} /></div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Wait!</h3>
        <p className="text-gray-500 font-medium mb-6">Leaving now will discard your progress. Submit current answers?</p>
        <div className="flex flex-col gap-3">
          <button onClick={onSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Submit & Finish</button>
          <button onClick={onLeave} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">Leave (No Save)</button>
          <button onClick={onCancel} className="w-full py-3 text-gray-400 font-bold hover:text-black transition-colors">Cancel, Go Back</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { width, height } = useWindowSize();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- DATA STATE ---
  const [quiz, setQuiz] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]); // Store ALL fetched questions
  const [activeQuestions, setActiveQuestions] = useState([]); // Store only the SELECTED questions

  // --- QUIZ LOGIC STATE ---
  const [isSetupMode, setIsSetupMode] = useState(true); // <--- NEW: Controls the Setup Screen
  const [questionCount, setQuestionCount] = useState(5); // Default to 5

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // --- UI FLAGS ---
  const [showExitModal, setShowExitModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  // --- 1. FETCH QUIZ DATA ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API_URL}/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Quiz not found");
        const data = await res.json();
        setQuiz(data);
        const questions = data.questions || [];
        setAllQuestions(questions);
        // Default the count to max available if less than 5
        setQuestionCount(Math.min(questions.length, 5));
      } catch (err) {
        toast.error("Could not load quiz.");
        navigate('/quizzes', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, token, API_URL, navigate]);

  // --- 2. PREVENT EXIT LOGIC (Only active when quiz actually starts) ---
  useEffect(() => {
    if (isSetupMode || isSubmitted) return; // Don't block exit on setup screen

    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSetupMode, isSubmitted]);


  // --- HANDLERS ---

  // A. START QUIZ + FULL SCREEN TRIGGER
  const handleStartQuiz = () => {
    if (questionCount > allQuestions.length || questionCount < 1) {
      toast.error(`Please select between 1 and ${allQuestions.length} questions.`);
      return;
    }

    // 1. Enter Full Screen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log("Fullscreen denied:", err));
    }

    // 2. Slice Questions (Optional: Add Shuffle here if you want)
    // We shuffle just in case so they don't get the same 5 every time
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, questionCount));

    // 3. Switch Mode
    setIsSetupMode(false);
  };

  // B. NAVIGATION
  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };
  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  // C. SUBMISSION
  const submitQuiz = async () => {
    // 1. Exit Full Screen safely
    if (document.exitFullscreen) {
        try { await document.exitFullscreen(); } catch (e) { /* ignore */ }
    }

    setShowExitModal(false);
    setIsCalculating(true); // START ANIMATION

    // Helper to convert index 0 -> "A", 1 -> "B", etc.
    const optionMap = ["A", "B", "C", "D"];

    // 2. Prepare Payload (Convert Index to Letter for Backend)
    const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
        question: qId,                // Backend expects 'question'
        selectedOption: optionMap[optIdx] // Backend expects "A", "B", "C", "D"
    }));

    console.log("🚀 Submitting Payload:", { answers: formattedAnswers });

    setTimeout(async () => {
      try {
        // 3. SEND REQUEST (Note the URL: /submissions/${id})
        const response = await fetch(`${API_URL}/submissions/${id}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ answers: formattedAnswers })
        });

        const data = await response.json();
        console.log("✅ Server Response:", data);

        if (!response.ok) {
            throw new Error(data.message || `Server Error: ${response.status}`);
        }

        // 4. Update State (Handle different response structures)
        setScoreData({
            score: data.score || 0,
            total: data.totalQuestions || questions.length,
            percentage: data.percentage || 0
        });
        
        setIsSubmitted(true); // Show Results
        
      } catch (err) {
        console.error("❌ Submission Failed:", err);
        toast.error(err.message || "Failed to submit. Check console.");
      } finally {
        // 5. STOP LOADING (This guarantees the spinner stops!)
        setIsCalculating(false); 
      }
    }, 2500);
  };

  const leaveWithoutSaving = () => {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
    setIsSubmitted(true);
    navigate('/quizzes', { replace: true });
  };


  // --- RENDERERS ---

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  // ---------------------------------------------------------
  // 1. SETUP MODE (The "Before" Screen)
  // ---------------------------------------------------------
  if (isSetupMode) {
    return (
      <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100 animate-in zoom-in duration-300">

          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto">
            <FiSettings size={32} />
          </div>

          <h2 className="text-3xl font-black text-center text-gray-900 mb-2">{quiz?.title}</h2>
          <p className="text-gray-500 text-center mb-8">Configure your session</p>

          <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Questions to Attempt (Max: {allQuestions.length})
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max={allQuestions.length}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-2xl font-black text-indigo-600 w-12 text-center">{questionCount}</span>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2"
          >
            <FiMaximize /> Start & Enter Fullscreen
          </button>

          <button onClick={() => navigate('/quizzes')} className="w-full py-3 mt-3 text-gray-400 font-bold hover:text-black text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. ACTIVE QUIZ MODE (Focus Mode)
  // ---------------------------------------------------------

  if (isCalculating) return <CalculatingGridGlitchGame />;

  if (isSubmitted && scoreData) {
    const isPass = scoreData.percentage >= 50;
    return (
      <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4">
        {isPass && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl text-center border border-zinc-100 animate-in zoom-in duration-300 relative z-10">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isPass ? <FiCheckCircle size={48} /> : <FiX size={48} />}
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{isPass ? "Quiz Crushed!" : "Nice Try!"}</h2>
          <p className="text-gray-500 mb-8 font-medium">{isPass ? "Outstanding performance." : "Review the material and try again."}</p>
          <div className="bg-zinc-50 rounded-3xl p-8 mb-8 border border-zinc-100 relative overflow-hidden">
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Final Score</span>
            <span className="text-7xl font-black text-gray-900 tracking-tighter">{Math.round(scoreData.percentage)}%</span>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-bold text-gray-600">{scoreData.score} Correct</span>
              <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-bold text-gray-600">{scoreData.total} Total</span>
            </div>
          </div>
          <button onClick={() => navigate('/quizzes')} className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl">Back to Quiz Hub</button>
        </div>
      </div>
    );
  }

  const question = activeQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans relative overflow-hidden">

      {/* HEADER */}
      <header className="h-20 border-b border-gray-100 flex items-center justify-between px-6 sm:px-12 bg-white z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black shadow-lg">Q</div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight line-clamp-1">{quiz?.title}</h1>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Focus Mode Active
            </p>
          </div>
        </div>
        <button onClick={() => setShowExitModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wider transition-colors">
          <FiLogOut size={16} /> <span className="hidden sm:inline">Quit</span>
        </button>
      </header>

      {/* PROGRESS BAR */}
      <div className="h-1.5 w-full bg-gray-100">
        <div className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
      </div>

      {/* QUESTION */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
            <span className="text-5xl font-black text-black-200">{String(currentQuestionIndex + 1).padStart(2, '0')}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Of {activeQuestions.length} Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-700 leading-tight mb-12">{question?.title}</h2>
          <div className="grid grid-cols-1 gap-4">
            {question?.options.map((option, idx) => {
              const isSelected = answers[question._id] === idx;
              return (
                <button key={idx} onClick={() => handleOptionSelect(question._id, idx)}
                  className={`group relative p-6 rounded-2xl text-left border-2 transition-all duration-200 ${isSelected ? 'border-black bg-zinc-50 shadow-lg scale-[1.01]' : 'border-gray-100 hover:border-gray-300 hover:bg-white'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? 'bg-black border-black text-white' : 'border-gray-200 text-gray-400 group-hover:border-gray-400'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium text-lg ${isSelected ? 'text-black' : 'text-gray-600'}`}>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-24 border-t border-gray-100 flex items-center justify-between px-6 sm:px-12 bg-white sticky bottom-0 z-20">
        <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 text-gray-400 font-bold hover:text-black disabled:opacity-30 px-4 py-2"><FiArrowLeft /> Previous</button>
        {currentQuestionIndex === activeQuestions.length - 1 ? (
          <button onClick={() => setShowExitModal(true)} className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 text-sm tracking-wide">Finish Quiz</button>
        ) : (
          <button onClick={handleNext} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 text-sm tracking-wide">Next Question</button>
        )}
      </footer>

      <ExitModal show={showExitModal} onCancel={() => setShowExitModal(false)} onSubmit={submitQuiz} onLeave={leaveWithoutSaving} />
    </div>
  );
};

export default TakeQuiz;