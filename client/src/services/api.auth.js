import API from "../lib/api";
export const loginApi = (email, password) => API.post("/auth/login", { email, password });
export const registerApi = (payload) => API.post("/auth/register", payload);
