import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import CourseForm from './CourseForm';

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [course, setCourse] = useState(null); // course data from server
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/courses/${courseId}`);
        if (!res.ok) throw new Error('Course not found.');
        const data = await res.json();
        setCourse(data);

        // Populate formData with fetched data
        setFormData({
          title: data.title || '',
          category: data.category || '',
          description: data.description || '',
          content: data.content || '',
        });
      } catch (error) {
        toast.error(error.message);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  // Save handler
  const handleSave = async (updatedData, file) => {
    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', updatedData.title);
      formPayload.append('category', updatedData.category);
      formPayload.append('description', updatedData.description);
      formPayload.append('content', updatedData.content);
      if (file) formPayload.append('pdfFile', file);

      const res = await fetch(`http://localhost:5001/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
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
