// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Set Axios default base URL
axios.defaults.baseURL = "http://localhost:5001"; // <-- backend port

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
        const res = await axios.get("/api/user/profile", {
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
      // Make a PUT request to your backend endpoint
      const res = await axios.put(
        "/api/auth/change-password",
        { currentPassword, newPassword }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Auth header
          },
        }
      );
      // Return the success message from the backend
      return res.data.message || "Password updated successfully!";
    } catch (err) {
      // Re-throw the specific error message from the backend API
      throw new Error(
        err.response?.data?.message || "An error occurred while updating the password."
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
        updateUserPassword // <-- Expose the new function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);