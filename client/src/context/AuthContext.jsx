import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';

// -----------------------------
// Mock API Utility
// -----------------------------
const API = {
  async request(url, method, data = null) {
    const token = localStorage.getItem("authToken");
    console.log(`[API] ${method} ${url}. Token present: ${!!token}`);

    if (url === '/user/profile') {
      if (!token || token.startsWith('expired')) {
        return Promise.reject({ response: { data: { message: "Token expired or invalid." } } });
      }
      const userId = token.split('.')[1];
      return { data: { id: userId, email: `${userId}@example.com`, name: `User ${userId}` } };
    }

    if (url === '/auth/login') {
      if (data.email === 'test@example.com' && data.password === 'password123') {
        const mockToken = `header.user123.signature`;
        return { data: { token: mockToken, user: { id: 'user123', email: 'test@example.com', name: 'Test User' } } };
      }
      return Promise.reject({ response: { data: { message: "Invalid credentials." } } });
    }

    if (url === '/auth/logout') {
      return { data: { message: 'Logged out successfully.' } };
    }

    return Promise.resolve({ data: {} });
  }
};

// -----------------------------
// 1. Auth Context
// -----------------------------
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

      setLoading(true);
      try {
        const res = await API.request("/user/profile", "GET");
        setUser(res.data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
        console.log("Token validated successfully.");
      } catch (err) {
        console.error("Token validation failed:", err);
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

  const value = useMemo(() => ({ token, user, login, logout, loading, isAuthenticated: !!user }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// -----------------------------
// 2. Protected Route
// -----------------------------
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading Session...</div>;
  if (!isAuthenticated) return null; // Navigation will redirect

  return element;
};

// -----------------------------
// 3. Login Component
// -----------------------------
const Login = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
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
      const res = await API.request('/auth/login', 'POST', { email, password });
      login(res.data.token, res.data.user);
    } catch (err) {
      console.error('Login Failed:', err.response?.data?.message || 'Check console.');
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

// -----------------------------
// 4. Home Component
// -----------------------------
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome Home, {user.name}!</h1>
      <p className="text-gray-600 mb-8">Your session is persistent until you log out.</p>

      <div className="bg-gray-50 p-6 rounded-xl border max-w-lg mx-auto">
        <h3 className="text-xl font-semibold mb-3">Session Details</h3>
        <p className="text-left"><span className="font-medium">User ID:</span> {user.id}</p>
        <p className="text-left"><span className="font-medium">Email:</span> {user.email}</p>
        <p className="text-left text-sm mt-3 text-red-600">* Refresh the page. You remain logged in.</p>
      </div>

      <button onClick={handleLogout} className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
        Logout
      </button>
    </div>
  );
};

// -----------------------------
// 5. Nav Component
// -----------------------------
const Nav = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  return (
    <nav className="p-4 bg-gray-100 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-black">CogitoSphere</Link>
        <div className="space-x-4">
          {isAuthenticated ? <span className="text-gray-700">Hello, {user?.name || 'User'}</span> : <Link to="/login" className="text-black hover:text-gray-700">Login</Link>}
        </div>
      </div>
    </nav>
  );
};

// -----------------------------
// 6. Main App Component
// -----------------------------
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Router>
        <AuthProvider>
          <Nav />
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<p className='text-center mt-10 text-xl'>Go to /login or /home</p>} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
              <Route path="*" element={<div className="text-center mt-20 text-red-500 text-2xl font-bold">404 - Not Found</div>} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}
