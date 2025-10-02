import API from "../lib/api";
export const loginApi = (email, password) => API.post("/auth/login", { email, password });
export const registerApi = (payload) => API.post("/auth/register", payload);
export const forgotPasswordApi = (email) => API.post("/auth/forgot-password", { email });
export const resetPasswordApi = (token, newPassword) =>
  API.post(`/auth/reset-password/${token}`, { newPassword });
