import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiArrowLeft, FiArrowRight, FiSend } from 'react-icons/fi';
import { getQuizApi, submitQuizApi } from '../../services/api.quizzes';

// Format time helper
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await getQuizApi(quizId);
                if (!data.questions || data.questions.length === 0) {
                    setError("This quiz has no questions yet.");
                }
                setQuiz(data);
            } catch (err) {
                toast.error("Failed to load the quiz.");
                setError("Could not find the quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (quizState === 'in_progress') {
            timerRef.current = setInterval(() => {
                setTimeTaken(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [quizState]);

    const handleSelectOption = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => setCurrentQuestionIndex(prev => Math.min(prev + 1, practiceCount - 1));
    const handlePrev = () => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;
        clearInterval(timerRef.current);

        const payload = {
            answers: Object.entries(answers).map(([qId, selectedOption]) => ({ question: qId, selectedOption })),
            timeTaken,
        };

        try {
            const { data } = await submitQuizApi(quizId, payload);
            setSubmissionResult(data);
            setQuizState('submitted');
            toast.success("Quiz submitted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit quiz.");
            setQuizState('in_progress');
        }
    };

    const handleStartWithSelection = () => {
        if (!practiceCount) {
            toast.error("Please select the number of questions to practice.");
            return;
        }
        setQuizState('in_progress');
    };

    if (loading) return <div className="text-center p-10">Loading Quiz...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];

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

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
            {quizState === 'not_started' && (
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border max-w-lg mx-auto">
                    <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
                    <p className="text-gray-600 mb-2">Subject: {quiz.subject}</p>
                    <p className="text-lg mb-6">This quiz contains {quiz.questions.length} questions.</p>

                    <div className="mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
                        <label className="font-semibold text-gray-700">Select number of questions:</label>
                        <select
                            className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={practiceCount || ''}
                            onChange={(e) => setPracticeCount(parseInt(e.target.value, 10))}
                        >
                            <option value="" disabled>Select</option>
                            {getDropdownOptions().map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleStartWithSelection} 
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md transform hover:-translate-y-0.5"
                    >
                        Start Quiz
                    </button>
                </div>
            )}

            {quizState === 'in_progress' && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold">{quiz.title}</h2>
                            <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {practiceCount}</p>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg">
                            <FiClock className="text-gray-600" />
                            <span>{formatTime(timeTaken)}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-6">{currentQuestion.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isSelected = answers[currentQuestion._id] === letter;
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleSelectOption(currentQuestion._id, letter)}
                                        className={`p-4 rounded-lg text-left border-2 transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                                    >
                                        <span className={`font-bold mr-3 ${isSelected ? 'text-white' : 'text-blue-600'}`}>{letter}.</span> {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t">
                        <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FiArrowLeft /> Previous
                        </button>
                        {currentQuestionIndex === practiceCount - 1 ? (
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
                                Submit <FiSend />
                            </button>
                        ) : (
                            <button onClick={handleNext} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                Next <FiArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {quizState === 'submitted' && submissionResult && (
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
                    <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
                    <p className="text-gray-600 mb-6">Your results for "{quiz.title}"</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                        <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                            <h3 className="text-lg font-bold text-green-800">{submissionResult.score} / {submissionResult.totalQuestions}</h3>
                            <p className="text-sm text-green-700">Correct Answers</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-bold text-blue-800">{submissionResult.percentage.toFixed(2)}%</h3>
                            <p className="text-sm text-blue-700">Percentage</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-bold text-yellow-800">{formatTime(submissionResult.timeTaken)}</h3>
                            <p className="text-sm text-yellow-700">Time Taken</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/quizzes')} className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                        Back to Quizzes
                    </button>
                </div>
            )}
        </div>
    );
}
