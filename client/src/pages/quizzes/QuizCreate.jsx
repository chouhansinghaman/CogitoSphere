import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QuizForm from './QuizForm';
import { createQuizApi } from '../../services/api.quizzes';

const QuizCreate = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            console.log("🚀 Sending this data to backend:", formData);
            await createQuizApi(formData);
            toast.success("Quiz created successfully!");
            navigate('/quizzes');
        } catch (error) {
            toast.error(error.message || "Could not create quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black">Create New Quiz</h1>
                <button onClick={() => navigate('/quizzes')} className="text-gray-600 hover:text-black transition-colors">
                    &larr; Back to Quizzes
                </button>
            </div>
            <QuizForm onSave={handleSave} isSubmitting={isSubmitting} />
        </div>
    );
};

export default QuizCreate;