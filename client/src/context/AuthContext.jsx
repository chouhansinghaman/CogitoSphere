// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// ✅ Set Axios default base URL from env (no quotes)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // e.g., https://your-backend.onrender.com/api

export const AuthProvider = ({ children }) => {
  // Persist token in localStorage
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Persist user in localStorage for instant load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Fetch user profile whenever token changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // persist user
      } catch (err) {
        console.error("Error fetching user profile:", err.response?.data || err.message);
        logout(); // invalid token, logout
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // --- LOGIN ---
  const login = (jwtToken, userData) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // --- UPDATE PASSWORD ---
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error("Authentication error. Please log in again.");
    try {
      const res = await axios.put(
        "/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.message || "Password updated successfully!";
    } catch (err) {
      throw new Error(err.response?.data?.message || "An error occurred while updating the password.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        loading,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
