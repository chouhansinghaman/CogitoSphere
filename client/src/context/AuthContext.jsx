import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// -------------------- API SETUP --------------------
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -------------------- AUTH CONTEXT --------------------
const AuthContext = createContext();
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        localStorage.removeItem(AUTH_USER_KEY);
        return;
      }

      try {
        const res = await API.get("/users/profile");
        setUser(res.data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
      } catch (err) {
        console.error("Profile fetch failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

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

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.put("/auth/change-password", { currentPassword, newPassword });
      return res.data.message;
    } catch (error) {
      console.error("Password update error:", error);
      throw new Error(error.response?.data?.message || "Failed to update password.");
    }
  };

  const value = useMemo(() => ({
    token,
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    setUser,
    updateUserPassword,
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// -------------------- PROTECTED ROUTE --------------------
const ProtectedRoute = ({ element: Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return Element;
};

// -------------------- NAV --------------------
const Nav = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  return (
    <nav className="p-4 bg-gray-100 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-black">CogitoSphere</Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <span className="text-gray-700">Hello, {user?.name}</span>
          ) : (
            <Link to="/login" className="text-black hover:text-gray-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// -------------------- LOGIN PAGE --------------------
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/home', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, ...userData } = res.data;
      login(token, userData);
      navigate('/home');
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 border rounded-xl shadow-lg mt-20 bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black" required />
        <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// -------------------- HOME PAGE --------------------
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome Home, {user.name}!</h1>
      <p className="text-gray-600 mb-8">You are successfully authenticated.</p>

      <div className="bg-gray-50 p-6 rounded-xl border max-w-lg mx-auto">
        <h3 className="text-xl font-semibold mb-3">Session Details</h3>
        <p className="text-left"><span className="font-medium">Email:</span> {user.email}</p>
        <p className="text-left"><span className="font-medium">Username:</span> {user.username}</p>
      </div>

      <button onClick={() => { logout(); navigate('/login'); }}
        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

// -------------------- SETTINGS (Placeholder) --------------------
const SettingsPlaceholder = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
      <p className="text-gray-600">This is a placeholder. Import your actual Settings component here later.</p>
    </div>
  );
};

// -------------------- APP --------------------
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Router>
        <AuthProvider>
          <Nav />
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              {/* ✅ Smart Root Route: Redirects based on Auth */}
              <Route path="/" element={<SmartRedirect />} />

              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
              <Route path="/settings" element={<ProtectedRoute element={<SettingsPlaceholder />} />} />
              <Route path="*" element={<div className="text-center mt-20 text-red-500 text-2xl font-bold">404 - Not Found</div>} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}

// -------------------- SMART REDIRECT --------------------
const SmartRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading session...</div>;
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
};
