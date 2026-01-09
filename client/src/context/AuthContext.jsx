import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

// --- 1. CONFIGURATION (Kept your Dev Mode logic) ---
const DEV_MODE = false; // Set to true to bypass backend

const DEV_USER = {
  _id: "1",
  name: "Dev Admin",
  username: "devadmin",
  email: "dev@local.test",
  role: "admin",
  avatar: "https://via.placeholder.com/150"
};

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

// --- 2. API SETUP (Kept your Axios Interceptor) ---
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// This automatically adds the token to every request (Essential for your Sidebar/Dashboard data)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 3. INITIALIZATION LOGIC (The "Brain") ---
  useEffect(() => {
    // A. Handle Dev Mode (Instant login for testing UI)
    if (DEV_MODE) {
      console.log("⚠️ Auth Provider: Running in DEV_MODE");
      setUser(DEV_USER);
      setToken("dev-token");
      setLoading(false);
      return;
    }

    // B. Real Authentication (Checks if you are already logged in)
    const initAuth = async () => {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!savedToken) {
        setLoading(false); // No token? Stop loading, stay logged out.
        return;
      }

      try {
        setToken(savedToken);
        // Verify token with backend to ensure it's still valid
        const res = await API.get("/users/profile");
        setUser(res.data);
        // Sync local storage just in case data changed
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
      } catch (err) {
        console.error("Session expired or invalid:", err);
        logout(); // Token is bad? Log them out.
      } finally {
        setLoading(false); // ✅ Fixes "Forever Loading" bug
      }
    };

    initAuth();
  }, []);

  // --- 4. ACTIONS (Login/Logout) ---
  const login = (jwtToken, userData) => {
    localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  // --- 5. EXPOSE DATA ---
  const value = useMemo(
    () => ({
      token,
      user,
      setUser, // Important for updating avatar/streak without re-login
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' // Helper for your Sidebar logic
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 6. CUSTOM HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};