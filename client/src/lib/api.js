import axios from "axios";

const API = axios.create({
  // FIX: Changed VITE_API_URL to VITE_API_BASE_URL to match your Vercel variable
  baseURL: import.meta.env.VITE_API_BASE_URL, 
});

// attach bearer token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// optional: response error normalization
API.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export default API;
