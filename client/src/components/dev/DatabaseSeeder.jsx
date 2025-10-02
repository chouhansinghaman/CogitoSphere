// src/components/dev/DatabaseSeeder.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi'; // 1. Import the X icon
import { createQuestionApi } from '../../services/api.questions';
import { initialQuestions } from '../../data/km-questions.js';

const DatabaseSeeder = ({ onSeedComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [seededCount, setSeededCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // 2. New state to control visibility

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSeedDatabase = async () => {
        if (!window.confirm(`Are you sure you want to add ${initialQuestions.length} questions to the database?`)) {
            return;
        }
        setIsLoading(true);
        toast.loading('Seeding database...');
        let successCount = 0;
        const creationPromises = initialQuestions.map(q => {
            const payload = { title: q.title, options: q.options, answer: q.answer, subject: q.subject };
            return createQuestionApi(payload)
                .then(() => { successCount++; })
                .catch(err => { console.error(`Failed to create question: "${q.title}"`, err); });
        });
        await Promise.all(creationPromises);
        setIsLoading(false);
        setSeededCount(successCount);
        toast.dismiss();
        if (successCount > 0) {
            toast.success(`Successfully created ${successCount} questions!`);
            setShowSuccess(true);
            if (onSeedComplete) {
                onSeedComplete();
            }
        } else {
            toast.error("Could not create any questions.");
        }
    };

    // 3. If the component is not visible, render nothing
    if (!isVisible) {
        return null;
    }

    return (
        <div className="relative p-4 my-4 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg text-center">
            {/* 4. The close button */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600 rounded-full"
                aria-label="Close seeder"
            >
                <FiX size={18} />
            </button>
            
            <h2 className="text-lg font-bold text-blue-800">Need Questions?</h2>
            <p className="text-blue-700 my-2 text-sm">
                Click here to add the 30 standard 'Knowledge Management' questions.
            </p>
            <button
                onClick={handleSeedDatabase}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Seeding...' : `Seed ${initialQuestions.length} Questions`}
            </button>
            
            {showSuccess && (
                <p className="mt-2 text-green-700 font-semibold animate-pulse">
                    Finished! {seededCount} questions were added and the list has been refreshed.
                </p>
            )}
        </div>
    );
};

export default DatabaseSeeder;