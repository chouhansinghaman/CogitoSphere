import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiClock, FiArrowLeft, FiArrowRight, FiSend, 
  FiCheckCircle, FiTarget, FiActivity, FiCpu, FiPlay 
} from 'react-icons/fi';
import { getQuizApi, submitQuizApi } from '../../services/api.quizzes';

// --- HELPER: Monospace Timer ---
const TimerDisplay = ({ seconds }) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return (
        <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-mono text-sm shadow-md">
            <FiClock className="animate-pulse text-green-400" />
            <span className="tracking-widest">{mins}:{secs}</span>
        </div>
    );
};

export default function TakeQuiz() {
    const { id: quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [quizState, setQuizState] = useState('not_started'); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeTaken, setTimeTaken] = useState(0);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [practiceCount, setPracticeCount] = useState(null);

    const timerRef = useRef(null);

    // --- FETCH QUIZ ---
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await getQuizApi(quizId);
                if (!data.questions || data.questions.length === 0) {
                    setError("This mission has no objectives yet.");
                }
                setQuiz(data);
            } catch (err) {
                toast.error("Failed to initialize mission.");
                setError("Mission data corrupted.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (quizState === 'in_progress') {
            timerRef.current = setInterval(() => {
                setTimeTaken(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [quizState]);

    // --- HANDLERS ---
    const handleSelectOption = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => setCurrentQuestionIndex(prev => Math.min(prev + 1, practiceCount - 1));
    const handlePrev = () => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));

    const handleSubmit = async () => {
        if (!window.confirm("Confirm submission?")) return;
        clearInterval(timerRef.current);

        const payload = {
            answers: Object.entries(answers).map(([qId, selectedOption]) => ({ question: qId, selectedOption })),
            timeTaken,
        };

        try {
            const { data } = await submitQuizApi(quizId, payload);
            setSubmissionResult(data);
            setQuizState('submitted');
            toast.success("Mission Complete!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed.");
            setQuizState('in_progress');
        }
    };

    const handleStartWithSelection = () => {
        if (!practiceCount) {
            toast.error("Select objectives count.");
            return;
        }
        setQuizState('in_progress');
    };

    const getDropdownOptions = () => {
        const options = [];
        for (let i = 5; i <= quiz.questions.length; i += 5) {
            options.push(i);
        }
        if (quiz.questions.length % 5 !== 0 && !options.includes(quiz.questions.length)) {
            options.push(quiz.questions.length);
        }
        return options;
    };

    // --- LOADING / ERROR STATES ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center animate-pulse">
                <FiCpu className="mx-auto text-4xl mb-4 text-gray-300" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Initializing...</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button onClick={() => navigate('/quizzes')} className="text-sm underline">Abort</button>
            </div>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / practiceCount) * 100;

    return (
        <div className="min-h-screen font-sans bg-gray-50 flex flex-col items-center justify-center p-4">
            
            {/* --- STATE 1: MISSION BRIEFING (START) --- */}
            {quizState === 'not_started' && (
                <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-gray-50 rounded-2xl mb-4 text-purple-600 border border-gray-100">
                            <FiTarget size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{quiz.title}</h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {quiz.subject}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {quiz.questions.length} Items Available
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
                            Select Intensity (Question Count)
                        </label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-4 text-center font-bold text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer"
                                value={practiceCount || ''}
                                onChange={(e) => setPracticeCount(parseInt(e.target.value, 10))}
                            >
                                <option value="" disabled>-- Select Count --</option>
                                {getDropdownOptions().map(opt => (
                                    <option key={opt} value={opt}>{opt} Questions</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                <FiActivity />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleStartWithSelection} 
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                    >
                        Initialize Mission <FiPlay />
                    </button>
                </div>
            )}

            {/* --- STATE 2: IN PROGRESS (QUIZ) --- */}
            {quizState === 'in_progress' && (
                <div className="w-full max-w-4xl">
                    {/* Header Bar */}
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-none">{quiz.title}</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                                Question {currentQuestionIndex + 1} / {practiceCount}
                            </p>
                        </div>
                        <TimerDisplay seconds={timeTaken} />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
                        <div 
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 min-h-[400px] flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-snug mb-8">
                                {currentQuestion.title}
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    const isSelected = answers[currentQuestion._id] === letter;
                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleSelectOption(currentQuestion._id, letter)}
                                            className={`
                                                group relative p-5 rounded-xl text-left border-2 transition-all duration-200 flex items-center gap-4
                                                ${isSelected 
                                                    ? 'border-black bg-black text-white shadow-lg transform scale-[1.01]' 
                                                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <span className={`
                                                w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors
                                                ${isSelected ? 'bg-white text-black' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}
                                            `}>
                                                {letter}
                                            </span>
                                            <span className="font-medium text-lg">{opt}</span>
                                            
                                            {isSelected && <FiCheckCircle className="absolute right-5 text-white" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                            <button 
                                onClick={handlePrev} 
                                disabled={currentQuestionIndex === 0} 
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <FiArrowLeft /> Previous
                            </button>
                            
                            {currentQuestionIndex === practiceCount - 1 ? (
                                <button 
                                    onClick={handleSubmit} 
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-200 transition-all hover:scale-105"
                                >
                                    Submit Mission <FiSend />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleNext} 
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-900 shadow-lg shadow-gray-200 transition-all hover:scale-105"
                                >
                                    Next <FiArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- STATE 3: MISSION REPORT (RESULTS) --- */}
            {quizState === 'submitted' && submissionResult && (
                <div className="w-full max-w-3xl animate-in zoom-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                        {/* Confetti / Glow */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-6">
                                <FiCheckCircle size={40} />
                            </div>
                            
                            <h1 className="text-4xl font-black text-gray-900 mb-2">Mission Complete!</h1>
                            <p className="text-gray-500 mb-10">Performance Report for "{quiz.title}"</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Score</p>
                                    <h3 className="text-3xl font-black text-gray-900">
                                        {submissionResult.score} <span className="text-gray-400 text-lg">/ {submissionResult.totalQuestions}</span>
                                    </h3>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Accuracy</p>
                                    <h3 className={`text-3xl font-black ${submissionResult.percentage >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {submissionResult.percentage.toFixed(0)}%
                                    </h3>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Time</p>
                                    <h3 className="text-3xl font-black text-blue-600 font-mono">
                                        {Math.floor(submissionResult.timeTaken / 60)}:{String(submissionResult.timeTaken % 60).padStart(2, '0')}
                                    </h3>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/quizzes')} 
                                className="px-10 py-4 bg-black text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                            >
                                Return to Base
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}