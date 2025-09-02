import API from "../lib/api";
export const submitQuizApi = (quizId, payload) => API.post(`/submissions/${quizId}`, payload);
export const mySubmissionsApi = () => API.get("/submissions/my");
export const adminQuizSubmissionsApi = (quizId) => API.get(`/submissions/quiz/${quizId}`);
