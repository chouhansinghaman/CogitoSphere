// src/pages/quizzes/QuizEdit.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getQuizApi, updateQuizApi } from '../../services/api.quizzes';
import { getQuestionsApi } from '../../services/api.questions';
import { FiPlusCircle, FiXCircle } from 'react-icons/fi';
import DatabaseSeeder from '../../components/dev/DatabaseSeeder';

const QuizEdit = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAllQuestions = async () => {
        try {
            const questionsRes = await getQuestionsApi();
            setAllQuestions(questionsRes.data);
        } catch (error) {
            toast.error("Failed to fetch the latest questions.");
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const quizRes = await getQuizApi(quizId);
                const quizData = quizRes.data;
                setTitle(quizData.title);
                setSubject(quizData.subject);
                setLevel(quizData.level);
                setSelectedQuestions(quizData.questions.map(q => q._id));
                await fetchAllQuestions();
            } catch (error) {
                toast.error("Failed to load quiz data.");
                navigate('/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [quizId, navigate]);
    
    const handleSeedComplete = () => {
        toast('Refreshing question list...', { icon: '🔄' });
        fetchAllQuestions();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { title, subject, level, questions: selectedQuestions };
        try {
            await updateQuizApi(quizId, payload);
            toast.success("Quiz updated successfully!");
            navigate('/quizzes');
        } catch (error) {
            toast.error(error.message || "Could not update quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddQuestion = (questionId) => {
        if (!selectedQuestions.includes(questionId)) {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
    };

    const handleRemoveQuestion = (questionId) => {
        setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    };

    const availableQuestions = allQuestions.filter(q =>
        (q.subject === subject || !q.subject) &&
        !selectedQuestions.includes(q._id)
    );

    const questionsInQuiz = allQuestions.filter(q => selectedQuestions.includes(q._id));

    if (loading) {
        return <div className="text-center p-10">Loading Quiz Editor...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black">Edit Quiz</h1>
                <button onClick={() => navigate('/quizzes')} className="text-gray-600 hover:text-black transition-colors">
                    &larr; Back to Quizzes
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200">
                {/* --- THIS SECTION IS NOW FULLY INCLUDED --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">Quiz Title</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
                        <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="level" className="block text-sm font-medium text-gray-600 mb-2">Difficulty Level</label>
                        <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Question Management Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Available Questions for '{subject}'</h3>
                        
                        {subject === 'Knowledge Management' && (
                            <DatabaseSeeder onSeedComplete={handleSeedComplete} />
                        )}
                        
                        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-2 bg-gray-50">
                            {availableQuestions.map(q => (
                                <div key={q._id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                    <span className="text-sm">{q.title}</span>
                                    <button type="button" onClick={() => handleAddQuestion(q._id)} className="text-green-500 hover:text-green-700">
                                        <FiPlusCircle size={20} />
                                    </button>
                                </div>
                            ))}
                            {availableQuestions.length === 0 && <p className="text-gray-500 text-sm">No more relevant questions to add.</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Questions in this Quiz ({selectedQuestions.length})</h3>
                        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-2 bg-gray-50">
                            {questionsInQuiz.length > 0 ? questionsInQuiz.map(q => (
                                <div key={q._id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                    <span className="text-sm">{q.title}</span>
                                    <button type="button" onClick={() => handleRemoveQuestion(q._id)} className="text-red-500 hover:text-red-700">
                                        <FiXCircle size={20} />
                                    </button>
                                </div>
                            )) : <p className="text-gray-500 text-sm">Select questions from the left panel.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizEdit;