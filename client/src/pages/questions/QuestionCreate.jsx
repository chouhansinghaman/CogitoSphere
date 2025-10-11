import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createQuestionApi } from "../../services/api.questions";
import { FiArrowLeft } from 'react-icons/fi';

const QuestionCreate = () => {
  const { quizId } = useParams(); // grab quiz id from URL if any
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [answer, setAnswer] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title,
      options: [options.A, options.B, options.C, options.D],
      answer,
      quiz: quizId || undefined,
    };

    try {
      await createQuestionApi(payload);
      toast.success("Question created successfully!");
      navigate(-1); // go back to previous page
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create the question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Question</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm sm:text-base hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          <FiArrowLeft size={18} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Question Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter question"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {['A', 'B', 'C', 'D'].map((opt) => (
          <div key={opt}>
            <label className="block text-sm font-medium text-gray-600 mb-1">Option {opt}</label>
            <input
              type="text"
              value={options[opt]}
              onChange={(e) => handleOptionChange(opt, e.target.value)}
              placeholder={`Enter option ${opt}`}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Correct Answer</label>
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['A', 'B', 'C', 'D'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  );
};

export default QuestionCreate;
