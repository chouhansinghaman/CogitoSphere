import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getQuizApi } from "../../services/api.quizzes";
import { submitQuizApi } from "../../services/api.submissions";

const letters = ["A", "B", "C", "D"];
const indexToLetter = (i) => letters[i] ?? null;

export default function TakeQuiz() {
  const { id } = useParams();
  const nav = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: "A" | "B" | "C" | "D" }
  const [start] = useState(Date.now());

  // fetch quiz by id
  useEffect(() => {
    getQuizApi(id)
      .then(({ data }) => setQuiz(data))
      .catch((e) => toast.error(e.response?.data?.message || e.message));
  }, [id]);

  // select answer
  const submit = async () => {
    if (!quiz) return;

    const payload = {
      timeTaken: Math.round((Date.now() - start) / 1000),
      answers: quiz.questions.map((q) => ({
        question: q._id,
        selectedOption: answers[q._id] ?? null,
      })),
    };

    try {
      const { data } = await submitQuizApi(quiz._id, payload);
      toast.success(`Submitted! Score: ${data.score}/${data.totalQuestions}`);
      nav("/leaderboard");
    } catch (e) {
      console.error("❌ Submit error:", e.response?.data || e.message); // 👈 debug log
      toast.error(e.response?.data?.message || e.message);
    }
  };
  
  if (!quiz) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="text-gray-600">{quiz.subject}</div>
      </div>

      {/* Quiz Questions */}
      {quiz.questions.map((q, qi) => (
        <div key={q._id} className="border rounded p-4">
          <div className="font-semibold mb-2">
            {qi + 1}. {q.title}
          </div>
          <div className="grid gap-2">
            {q.options.map((opt, idx) => {
              const chosen = answers[q._id] === indexToLetter(idx);
              return (
                <button
                  key={idx}
                  onClick={() => select(q._id, idx)}
                  className={`text-left border rounded p-2 ${chosen ? "bg-black text-white" : ""
                    }`}
                >
                  <span className="font-mono mr-2">{letters[idx]}.</span> {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <button
        onClick={submit}
        className="bg-black text-white rounded px-4 py-2"
      >
        Submit Quiz
      </button>
    </div>
  );
}
