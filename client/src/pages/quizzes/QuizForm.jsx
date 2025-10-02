import React, { useState, useEffect } from 'react';
import { getQuestionsApi } from '../../services/api.questions';
import toast from 'react-hot-toast';
import { FiPlusCircle, FiXCircle } from 'react-icons/fi';

const QuizForm = ({ onSave, initialData = null, isSubmitting }) => {
    const isEditing = !!initialData;

    // --- State for basic info ---
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('Beginner');

    // --- State for question management (only used in edit mode) ---
    const [allQuestions, setAllQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // --- Effects ---
    // Fetch all available questions when in edit mode
    useEffect(() => {
        if (isEditing) {
            setLoadingQuestions(true);
            getQuestionsApi()
                .then(({ data }) => setAllQuestions(data))
                .catch(() => toast.error("Failed to fetch questions."))
                .finally(() => setLoadingQuestions(false));
        }
    }, [isEditing]);

    // Populate form when initialData is available (for editing)
    useEffect(() => {
        if (isEditing && initialData) {
            setTitle(initialData.title);
            setSubject(initialData.subject);
            setLevel(initialData.level || 'Beginner');
            setSelectedQuestions(initialData.questions || []);
        }
    }, [initialData, isEditing]);

    // --- Handlers ---
    const handleAddQuestion = (questionId) => {
        if (!selectedQuestions.includes(questionId)) {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
    };

    const handleRemoveQuestion = (questionId) => {
        setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Construct the payload based on whether we are editing or not
        const payload = { title, subject, level };
        if (isEditing) {
            payload.questions = selectedQuestions;
        }
        onSave(payload);
    };

    // --- Computed values for question lists ---
    const availableQuestions = allQuestions.filter(q => !selectedQuestions.includes(q._id));
    const questionsInQuiz = allQuestions.filter(q => selectedQuestions.includes(q._id));

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200">
            {/* Basic Info */}
            <div className="space-y-4">
                {/* Title, Subject, Level inputs remain here... */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">Quiz Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., JavaScript Fundamentals" className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
                    <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Computer Science" className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-600 mb-2">Difficulty Level</label>
                    <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            </div>

            {/* --- Question Selector: ONLY shows when editing --- */}
            {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    {/* Available Questions */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Available Questions</h3>
                        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-2 bg-gray-50">
                            {loadingQuestions ? <p>Loading questions...</p> : availableQuestions.map(q => (
                                <div key={q._id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                    <span className="text-sm">{q.title}</span>
                                    <button type="button" onClick={() => handleAddQuestion(q._id)} className="text-green-500 hover:text-green-700">
                                        <FiPlusCircle size={20} />
                                    </button>
                                </div>
                            ))}
                            {!loadingQuestions && availableQuestions.length === 0 && <p className="text-gray-500 text-sm">No more questions to add.</p>}
                        </div>
                    </div>

                    {/* Selected Questions */}
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
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Quiz')}
                </button>
            </div>
        </form>
    );
};

export default QuizForm;