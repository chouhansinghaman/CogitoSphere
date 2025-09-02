import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuizzesApi } from "../../services/api.quizzes";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const { user, token } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    getQuizzesApi()
      .then(({ data }) => setQuizzes(data))
      .catch((e) => toast.error(e.message));
  }, []);

  const isAdmin = Boolean(token && user?.role === "admin");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        {isAdmin && (
          <button
            onClick={() => nav("/quizzes/new")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ➕ Add Quiz
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {quizzes.map((q) => (
          <div key={q._id} className="border rounded p-4">
            <div className="font-semibold">{q.title}</div>
            <div className="text-sm text-gray-600">{q.subject}</div>
            <Link to={`/quiz/${q._id}`} className="inline-block mt-3 underline">
              Take Quiz →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
