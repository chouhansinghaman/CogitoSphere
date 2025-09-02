import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createQuizApi } from "../../services/api.quizzes";
import { getQuestionsApi } from "../../services/api.questions";

export default function NewQuiz() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    questions: [],
  });

  const [allQuestions, setAllQuestions] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getQuestionsApi()
      .then(({ data }) => setAllQuestions(data))
      .catch((e) => toast.error("Failed to load questions: " + e.message));
  }, []);

  const toggleQuestion = (id) => {
    setForm((prev) => {
      const exists = prev.questions.includes(id);
      return {
        ...prev,
        questions: exists
          ? prev.questions.filter((q) => q !== id)
          : [...prev.questions, id],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || form.questions.length === 0) {
      toast.error("Fill all fields and select at least one question.");
      return;
    }
    try {
      await createQuizApi(form);
      toast.success("✅ Quiz created!");
      nav("/quizzes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Quiz</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Quiz Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />

        <div className="border rounded p-3 max-h-64 overflow-y-auto">
          <h2 className="font-semibold mb-2">Select Questions</h2>
          {allQuestions.map((q) => (
            <label key={q._id} className="block">
              <input
                type="checkbox"
                checked={form.questions.includes(q._id)}
                onChange={() => toggleQuestion(q._id)}
                className="mr-2"
              />
              {q.title} ({q.subject})
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
}
