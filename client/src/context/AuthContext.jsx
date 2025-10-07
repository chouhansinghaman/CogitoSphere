import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';

// Utility for making API calls and automatically handling tokens
const API = {
  // Mock function for API calls, simulates axios interceptors
  async request(url, method, data = null) {
    const token = localStorage.getItem("authToken");
    
    // Simulate API request structure
    console.log(`[API] Sending ${method} to ${url}. Token present: ${!!token}`);
    
    // 1. Simulating Token Validation (Persistence Check)
    if (url === '/user/profile') {
      if (!token || token.startsWith('expired')) {
        return Promise.reject({ response: { data: { message: "Token expired or invalid." } } });
      }
      // Decode user data from mock token for successful response
      const userId = token.split('.')[1];
      return { data: { id: userId, email: `${userId}@example.com`, name: `User ${userId}` } };
    }

    // 2. Simulating Login
    if (url === '/auth/login') {
      if (data.email === 'test@example.com' && data.password === 'password123') {
        const mockToken = `header.user123.signature`;
        return { data: { token: mockToken, user: { id: 'user123', email: 'test@example.com', name: 'Test User' } } };
      }
      return Promise.reject({ response: { data: { message: "Invalid credentials." } } });
    }

    // 3. Simulating Logout (No actual API call needed, just for structure)
    if (url === '/auth/logout') {
      return { data: { message: 'Logged out successfully.' } };
    }

    return Promise.resolve({ data: {} });
  }
};


// ---------------------------------------------------------------------
// 1. AuthContext (The core of session persistence)
// ---------------------------------------------------------------------

const AuthContext = createContext();

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage for instant load
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true); // Tracks initial token validation

  // This useEffect handles session persistence on initial load and token changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      // 1. If no token, we are logged out. Stop loading.
      if (!token) {
        setUser(null);
        setLoading(false);
        // Clear potential half-stored state if token is null
        localStorage.removeItem(AUTH_USER_KEY); 
        return;
      }

      setLoading(true);
      try {
        // 2. Token exists: Validate it by calling the protected profile endpoint
        // This is the key step for "staying logged in"
        const res = await API.request("/user/profile", "GET");
        
        // 3. Success: Update user state and persist in localStorage
        setUser(res.data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
        console.log("Token validated successfully. User state restored.");

      } catch (err) {
        // 4. Failure: Token is invalid/expired. Force logout.
        console.error("Token validation failed. Forcing logout:", err);
        logout(); // This clears token and user state
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]); // Re-run whenever the token state changes (login/logout/initial read)

  const login = (jwtToken, userData) => {
    localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    // Updating token state triggers the useEffect to validate/confirm session
    setToken(jwtToken); 
    setUser(userData); 
  };

  const logout = () => {
    // Clear all storage and reset state
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    // Setting token to null triggers the useEffect to confirm logged out state
    setToken(null);
    setUser(null);
  };
  
  const value = useMemo(() => ({ token, user, login, logout, loading, isAuthenticated: !!user }), [token, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


// ---------------------------------------------------------------------
// 2. Protected Route Wrapper
// ---------------------------------------------------------------------

const ProtectedRoute = ({ element: Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading Session...</div>;
  }

  // Redirect unauthenticated users to the login page, remembering where they tried to go
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return Element;
};


// ---------------------------------------------------------------------
// 3. Components (Simplified versions)
// ---------------------------------------------------------------------

const Login = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.request('/auth/login', 'POST', { email, password });
      // SUCCESS: Save token and user data via AuthContext
      login(res.data.token, res.data.user); 
      console.log('Login successful! Redirecting to home.');
      // Navigation is now handled by the useEffect above
    } catch (error) {
      console.error('Login Failed:', error.response?.data?.message || 'Check console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 border rounded-xl shadow-lg mt-20 bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

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
      <p className="text-gray-600 mb-8">You are successfully authenticated. Your session will persist until you log out.</p>
      
      <div className="bg-gray-50 p-6 rounded-xl border max-w-lg mx-auto">
        <h3 className="text-xl font-semibold mb-3">Session Details (from AuthContext)</h3>
        <p className="text-left"><span className="font-medium">User ID:</span> {user.id}</p>
        <p className="text-left"><span className="font-medium">Email:</span> {user.email}</p>
        <p className="text-left text-sm mt-3 text-red-600">
          * Try refreshing the page now. You will stay logged in.
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------
// 4. Main App Component and Structure
// ---------------------------------------------------------------------

const Nav = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return null;

  return (
    <nav className="p-4 bg-gray-100 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-black">CogitoSphere</Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <span className="text-gray-700">Hello, {user?.name || 'User'}</span>
          ) : (
            <Link to="/login" className="text-black hover:text-gray-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Simplified Navigate component for use in ProtectedRoute
const Navigate = ({ to, replace }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Router>
        <AuthProvider>
          <Nav />
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<p className='text-center mt-10 text-xl'>Go to /login or /home</p>} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Route */}
              <Route 
                path="/home" 
                element={<ProtectedRoute element={<Home />} />} 
              />
              
              {/* Fallback for unhandled paths */}
              <Route path="*" element={<div className="text-center mt-20 text-red-500 text-2xl font-bold">404 - Not Found (Ensure Render Rewrite Rule is Active!)</div>} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}
