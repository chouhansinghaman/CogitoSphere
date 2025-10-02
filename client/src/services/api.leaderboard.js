import API from "../lib/api";

export const getLeaderboardApi = () => API.get("/leaderboard");
