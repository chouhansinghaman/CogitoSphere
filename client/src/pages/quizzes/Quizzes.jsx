import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getQuizzesApi, deleteQuizApi } from "../../services/api.quizzes";
import { 
  FiPlus, FiEdit2, FiTrash2, FiPlay, FiSearch, 
  FiTarget, FiCpu, FiCode, FiZap, FiActivity, FiLayers 
} from 'react-icons/fi';

// --- HELPER: Get Icon based on Subject ---
const getSubjectIcon = (subject = "") => {
    const sub = subject.toLowerCase();
    if (sub.includes("code") || sub.includes("program")) return FiCode;
    if (sub.includes("math") || sub.includes("logic")) return FiCpu;
    if (sub.includes("react") || sub.includes("web")) return FiLayers;
    if (sub.includes("fast") || sub.includes("quick")) return FiZap;
    return FiTarget; // Default
};

// --- SUB-COMPONENT: Quiz Card ---
const QuizCard = ({ quiz, isAdmin, onEdit, onDelete, onAddQuestion }) => {
  const navigate = useNavigate();
  const Icon = getSubjectIcon(quiz.subject);

  return (
    <div className="group relative w-full h-full flex flex-col cursor-pointer">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Card Content */}
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
        
        {/* Admin Controls (Floating Top Right) */}
        {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddQuestion(quiz._id); }} 
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 rounded-lg shadow-sm transition-all"
                    title="Add Question"
                >
                    <FiPlus size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(quiz._id); }} 
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all"
                    title="Edit Quiz"
                >
                    <FiEdit2 size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(quiz._id); }} 
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-lg shadow-sm transition-all"
                    title="Delete Quiz"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        )}

        {/* Body */}
        <div onClick={() => navigate(`/quiz/${quiz._id}`)}>
            {/* Header with Icon */}
            <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl">
                   <Icon size={24} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                    {quiz.level || "General"}
                </div>
            </div>
            
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {quiz.subject}
            </p>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                {quiz.title}
            </h3>
        </div>

        {/* Footer */}
        <div className="mt-6">
            <button 
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-lg shadow-gray-200"
            >
                Start Challenge <FiPlay size={10} className="ml-1" />
            </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Quizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const { data } = await getQuizzesApi();
        const quizList = Array.isArray(data) ? data : data?.quizzes || [];
        setQuizzes(quizList);
        setFilteredQuizzes(quizList);
      } catch (error) {
        toast.error(error.message || "Could not fetch quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // --- SEARCH FILTER ---
  useEffect(() => {
      if(!searchTerm) {
          setFilteredQuizzes(quizzes);
      } else {
          const lowerTerm = searchTerm.toLowerCase();
          setFilteredQuizzes(quizzes.filter(q => 
              q.title.toLowerCase().includes(lowerTerm) || 
              q.subject.toLowerCase().includes(lowerTerm)
          ));
      }
  }, [searchTerm, quizzes]);

  // --- HANDLERS ---
  const handleCreate = () => navigate('/quizzes/create');
  const handleEdit = (quizId) => navigate(`/quizzes/edit/${quizId}`);
  const handleAddQuestion = (quizId) => navigate(`/questions/create/${quizId}`);

  const handleDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await deleteQuizApi(quizId);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      toast.success("Quiz deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Could not delete.");
    }
  };

  return (
    <div className="p-6 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-black mb-1">Skill Checks</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Season 0 • Assessments</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Find a challenge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
            </div>

            {/* Admin Create */}
            {isAdmin && (
                <button 
                    onClick={handleCreate} 
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-gray-200"
                >
                    <FiPlus size={16} /> <span className="hidden md:inline">Create</span>
                </button>
            )}
        </div>
      </div>

      {/* GRID */}
      <section>
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading assessments...</div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuizzes.map((quiz) => (
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
          <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4 text-gray-400"><FiActivity size={24} /></div>
            <h3 className="text-gray-900 font-bold mb-1">No quizzes found</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {isAdmin ? "Create one to get started" : "Check back later"}
            </p>
          </div>
        )}
      </section>

    </div>
  );
}