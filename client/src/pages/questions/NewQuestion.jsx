import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestionApi } from "../../services/api.questions";
import toast from "react-hot-toast";

export default function NewQuestion() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    subject: "",
    options: ["", "", "", ""],
    answer: "A",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuestionApi(form);
      toast.success("✅ Question created!");
      nav("/questions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create question");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Question</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Question title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {form.options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className="w-full border p-2 rounded"
          />
        ))}

        <select
          name="answer"
          value={form.answer}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="A">Answer A</option>
          <option value="B">Answer B</option>
          <option value="C">Answer C</option>
          <option value="D">Answer D</option>
        </select>

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Save Question
        </button>
      </form>
    </div>
  );
}
