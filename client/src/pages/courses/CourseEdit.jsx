import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import CourseForm from './CourseForm';

const CourseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        content: '',
    });
    // This state will hold either the existing URL or the new file object
    const [pdfFile, setPdfFile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return; // Prevent fetching with undefined ID
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/courses/${id}`);
                if (!res.ok) {
                    throw new Error('Course not found.');
                }
                const responseData = await res.json();
                const courseData = responseData.course; // Correctly destructure the 'course' object

                setFormData({
                    title: courseData.title || '',
                    category: courseData.category || '',
                    description: courseData.description || '',
                    content: courseData.content || '',
                });

                if (courseData.pdfUrl) {
                    setPdfFile({ name: courseData.pdfUrl.split('/').pop(), url: courseData.pdfUrl }); // Set PDF to URL object
                }
            } catch (error) {
                toast.error(error.message);
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, navigate, API_URL]);

    const handleSave = async (updatedData, file) => {
        setIsSubmitting(true);
        try {
            const formPayload = new FormData();
            formPayload.append('title', updatedData.title);
            formPayload.append('category', updatedData.category);
            formPayload.append('description', updatedData.description);
            formPayload.append('content', updatedData.content);

            // Append the file if a new one is selected
            if (file instanceof File) {
                formPayload.append('pdfFile', file);
            } else if (file === null) {
                // Explicitly tell the backend to remove the file if it was removed on the frontend
                formPayload.append('pdfFile', 'REMOVE');
            }

            const res = await fetch(`${API_URL}/courses/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formPayload,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to update course.');
            }

            toast.success('Course updated successfully!');
            navigate('/courses');
        } catch (error) {
            toast.error(error.message || 'Could not update course.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-10">Loading course...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-black">Edit Course</h1>
                <button
                    onClick={() => navigate('/courses')}
                    className="text-gray-600 hover:text-black transition-colors"
                >
                    &larr; Back to Courses
                </button>
            </div>
            <CourseForm
                formData={formData}
                setFormData={setFormData}
                pdfFile={pdfFile}
                setPdfFile={setPdfFile}
                onSave={handleSave}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default CourseEdit;