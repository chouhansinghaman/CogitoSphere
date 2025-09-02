import { useEffect, useState } from "react";
import { getQuestionsApi } from "../../services/api.questions";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Questions() {
  const [items, setItems] = useState([]);
  const { user, token } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    getQuestionsApi()
      .then(({ data }) => setItems(data))
      .catch((e) => toast.error(e.message));
  }, []);

  const isAdmin = Boolean(token && user?.role === "admin");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Question Bank</h1>

        {isAdmin && (
          <button
            onClick={() => nav("/questions/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Question
          </button>
        )}
      </div>

      <ul className="space-y-4">
        {items.map((q) => (
          <li key={q._id} className="border rounded p-4">
            <div className="font-semibold">{q.title}</div>
            <div className="text-sm text-gray-600 mb-2">{q.subject}</div>
            <ol className="list-decimal pl-5">
              {q.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
}
