import API from "../lib/api";
export const getQuestionsApi = () => API.get("/questions");               // public
export const createQuestionApi = (body) => API.post("/questions", body);  // admin only
