// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// ✅ Set Axios default base URL from env (do NOT wrap in quotes)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // <-- backend URL from .env

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Fetch user profile whenever the token changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false); // Stop loading if no token
        return;
      }

      setLoading(true);
      try {
        // ✅ Since VITE_API_BASE_URL already has /api, remove /api from path
        const res = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(
          "Error fetching user profile:",
          err.response?.data || err.message
        );
        logout(); // Invalid token, logout
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Login stores token and user data
  const login = (jwtToken, userData) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  // Logout clears everything
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // --- NEW FUNCTION TO UPDATE PASSWORD VIA API ---
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!token) {
      throw new Error("Authentication error. Please log in again.");
    }
    try {
      // ✅ Remove extra /api
      const res = await axios.put(
        "/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.message || "Password updated successfully!";
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          "An error occurred while updating the password."
      );
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
