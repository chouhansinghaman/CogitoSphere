import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import CourseForm from './CourseForm';
// No extra import is needed

const CourseCreate = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        content: '',
    });
    const [pdfFile, setPdfFile] = useState(null);

    // State to control the modal's visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBackClick = () => {
        const hasUnsavedChanges =
            Object.values(formData).some(value => value !== '') || pdfFile !== null;

        if (hasUnsavedChanges) {
            setIsModalOpen(true); // Open the integrated modal
        } else {
            navigate('/courses');
        }
    };

    const handleConfirmDiscard = () => {
        setIsModalOpen(false);
        navigate('/courses');
    };

    const handleSave = async (courseData, file) => {
        if (!courseData.title || !courseData.description || !courseData.category) {
            return toast.error("Please fill out all required text fields.");
        }
        setIsSubmitting(true);
        const data = new FormData();
        data.append('title', courseData.title);
        data.append('description', courseData.description);
        data.append('category', courseData.category);
        data.append('content', courseData.content);
        if (file) {
            data.append('pdfFile', file);
        }
        try {
            const res = await fetch("import.meta.env.VITE_API_BASE_URL/api/courses", {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data,
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create course.");
            }
            toast.success("Course created successfully!");
            navigate('/courses');
        } catch (error) {
            toast.error(error.message || "Could not create course.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black">Create New Course</h1>
                <button
                    onClick={handleBackClick}
                    className="text-gray-600 hover:text-black transition-colors"
                >
                    &larr; Back to Courses
                </button>
            </div>

            <CourseForm
                onSave={handleSave}
                isSubmitting={isSubmitting}
                formData={formData}
                setFormData={setFormData}
                pdfFile={pdfFile}
                setPdfFile={setPdfFile}
            />

            {/* --- Integrated Confirmation Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md space-y-4 shadow-xl">
                        <h2 className="text-xl font-bold">Discard Changes?</h2>
                        <p className="text-gray-600">
                            You have unsaved changes. Are you sure you want to discard them and go back?
                        </p>
                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDiscard}
                                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCreate;