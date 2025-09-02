import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPostsApi, createPostApi, answerPostApi, votePostApi } from "../../services/api.community";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", subject: "" });

  const load = () => {
    getPostsApi()
      .then(({ data }) => setPosts(data))
      .catch((e) => toast.error(e.message));
  };

  useEffect(() => { load(); }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      await createPostApi(form);
      setForm({ title: "", body: "", subject: "" });
      toast.success("Posted");
      load();
    } catch (e) { toast.error(e.message); }
  };

  const addAnswer = async (id, text) => {
    try { await answerPostApi(id, { text }); load(); }
    catch (e) { toast.error(e.message); }
  };

  const vote = async (id, v) => {
    try { await votePostApi(id, { vote: v }); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <form onSubmit={submitPost} className="border rounded p-4 space-y-3">
        <h2 className="font-bold text-lg">Ask the community</h2>
        <input className="w-full border rounded p-2" placeholder="Title"
               value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <input className="w-full border rounded p-2" placeholder="Subject"
               value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <textarea className="w-full border rounded p-2" rows={4} placeholder="Details"
               value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/>
        <button className="bg-black text-white rounded px-4 py-2">Post</button>
      </form>

      <div className="space-y-4">
        {posts.map(p => (
          <div key={p._id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">{p.subject} • by {p?.askedBy?.userName || "user"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="border rounded px-2" onClick={() => vote(p._id, 1)}>👍 {p.votes}</button>
                <button className="border rounded px-2" onClick={() => vote(p._id, -1)}>👎</button>
              </div>
            </div>

            <p className="mt-3">{p.body}</p>

            <div className="mt-4">
              <div className="font-medium mb-1">Answers</div>
              <ul className="space-y-2">
                {p.answers?.map((a,i) => (
                  <li key={i} className="border rounded p-2">
                    <div className="text-sm text-gray-500">by {a?.answeredBy?.userName || "user"}</div>
                    <div>{a.text}</div>
                  </li>
                ))}
              </ul>

              <AddAnswer onSubmit={(txt)=>addAnswer(p._id, txt)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddAnswer({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <form className="mt-2 flex gap-2" onSubmit={(e)=>{e.preventDefault(); onSubmit(text); setText("");}}>
      <input className="flex-1 border rounded p-2" placeholder="Write an answer..." value={text} onChange={e=>setText(e.target.value)} />
      <button className="border rounded px-3">Reply</button>
    </form>
  );
}
