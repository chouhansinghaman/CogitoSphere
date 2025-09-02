import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getQuizzesApi, deleteQuizApi } from "../../services/api.quizzes";

export default function AdminQuizzes() {
  const [items, setItems] = useState([]);
  const load = () => getQuizzesApi().then(({data})=>setItems(data)).catch(e=>toast.error(e.message));
  useEffect(()=>{ load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    try { await deleteQuizApi(id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Quizzes</h1>
      <div className="grid gap-3">
        {items.map(q => (
          <div key={q._id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{q.title}</div>
              <div className="text-sm">{q.subject} • {q.questions?.length} questions</div>
            </div>
            <button onClick={()=>remove(q._id)} className="border rounded px-3 py-1">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
