import { useEffect, useState } from "react";
import { getLeaderboardApi } from "../../services/api.leaderboard";
import toast from "react-hot-toast";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getLeaderboardApi()
      .then(({ data }) => setRows(data))
      .catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Avg %</th>
              <th className="p-2 text-left">Quizzes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{r?._id?.userName || r?._id?.name || r?._id?.email}</td>
                <td className="p-2">{r.avgPercentage?.toFixed(1)}</td>
                <td className="p-2">{r.totalQuizzes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
