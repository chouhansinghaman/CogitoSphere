// src/lib/api.js
import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_BASE_URL,
=======
  baseURL: import.meta.env.VITE_API_URL, // ✅ points to local or production backend
>>>>>>> 31fbc20d9410aa9b8ec6c40ba153562c1dc5dcda
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export default API;
