import API from "../lib/api";

// --- Quizzes API ---
export const getQuizzesApi = () => API.get("/quizzes");
export const getQuizApi = (quizId) => API.get(`/quizzes/${quizId}`);
export const createQuizApi = (data) => API.post("/quizzes", data);
export const editQuizApi = (quizId, data) => API.put(`/quizzes/${quizId}`, data); // Optional alias
export const updateQuizApi = (quizId, data) => API.put(`/quizzes/${quizId}`, data); // <-- ADD THIS
export const deleteQuizApi = (quizId) => API.delete(`/quizzes/${quizId}`);

// --- Submissions API ---
export const submitQuizApi = (quizId, payload) => API.post(`/submissions/${quizId}`, payload);
export const mySubmissionsApi = () => API.get("/submissions/my");
export const adminQuizSubmissionsApi = (quizId) => API.get(`/submissions/quiz/${quizId}`);
