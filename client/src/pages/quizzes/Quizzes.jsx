import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getQuizzesApi, deleteQuizApi } from "../../services/api.quizzes";
import { FiPlus, FiEdit, FiTrash2, FiChevronRight } from 'react-icons/fi';

// --- QUIZ CARD COMPONENT ---
const QuizCard = ({ quiz, isAdmin, onEdit, onDelete, onAddQuestion }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl flex flex-col justify-between h-full group transition-all duration-300 relative hover:shadow-lg hover:-translate-y-1"
    >
      <div className='p-6 flex flex-col flex-grow'>
        <div className='flex-grow'>
          <p className="text-sm font-semibold text-blue-600 mb-1">{quiz.subject}</p>
          <h3 className="text-lg font-bold text-black leading-tight mb-2">{quiz.title}</h3>
          <p className="text-xs text-gray-500">{quiz.level}</p>
        </div>

        {/* --- CARD FOOTER --- */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/quiz/${quiz._id}`)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Take Quiz <FiChevronRight />
          </button>

          {/* --- ADMIN-ONLY ADD QUESTION SHORTCUT --- */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddQuestion(quiz._id);
              }}
              className="p-2 bg-black text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <FiPlus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* --- Admin Edit/Delete Controls --- */}
      {isAdmin && (
        <div
          className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(quiz._id)}
            className="p-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full text-gray-700 transition-colors"
            aria-label="Edit quiz"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(quiz._id)}
            className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full text-gray-700 transition-colors"
            aria-label="Delete quiz"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN QUIZZES PAGE COMPONENT ---
export default function Quizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await getQuizzesApi();
        setQuizzes(data || []);
      } catch (error) {
        toast.error(error.message || "Could not fetch quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // --- NAVIGATION HANDLERS ---
  const handleCreate = () => navigate('/quizzes/create');
  const handleEdit = (quizId) => navigate(`/quizzes/edit/${quizId}`);
  const handleAddQuestion = (quizId) => navigate(`/questions/create/${quizId}`);

  const handleDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteQuizApi(quizId);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      toast.success("Quiz deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Could not delete the quiz.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-sans">

      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black">Quizzes</h1>
        {isAdmin && (
          <button onClick={handleCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <FiPlus size={18} />
            <span>Create Quiz</span>
          </button>
        )}
      </header>

      <section className="flex-1">
        {loading ? (
          <div className="text-center p-10 text-gray-500">Loading quizzes...</div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddQuestion={handleAddQuestion}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-2xl">
            <h3 className="text-xl font-semibold text-black">No quizzes found</h3>
            <p className="text-gray-600 mt-2">
              {isAdmin ? "Click 'Create Quiz' to get started." : "Check back later for new quizzes!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
