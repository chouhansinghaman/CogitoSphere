import API from "../lib/api";
export const getQuizzesApi = () => API.get("/quizzes");
export const getQuizApi = (id) => API.get(`/quizzes/${id}`);
export const createQuizApi = (payload) => API.post("/quizzes", payload);     // admin
export const updateQuizApi = (id, payload) => API.put(`/quizzes/${id}`, payload); // admin
export const deleteQuizApi = (id) => API.delete(`/quizzes/${id}`);           // admin
