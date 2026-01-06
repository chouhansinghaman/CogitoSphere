import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import axios from "axios";

/* =====================================================
   🔧 DEV MODE CONFIG
===================================================== */
const DEV_MODE = true; // 🔴 set false to enable real auth later

const DEV_USER = {
  id: 1,
  name: "Dev Admin",
  username: "devadmin",
  email: "dev@local.test",
  role: "admin",
};

const DEV_TOKEN = "dev-token-no-auth";

/* =====================================================
   API SETUP (kept for future use)
===================================================== */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =====================================================
   AUTH CONTEXT
===================================================== */
const AuthContext = createContext();

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 AUTO LOGIN (NO BACKEND) */
  useEffect(() => {
    if (DEV_MODE) {
      setUser(DEV_USER);
      setToken(DEV_TOKEN);
      setLoading(false);
      return;
    }

    // ---- REAL AUTH (disabled in DEV_MODE) ----
    const fetchUserProfile = async () => {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const res = await API.get("/users/profile");
        setUser(res.data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const login = (jwtToken, userData) => {
    if (DEV_MODE) return;
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

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      setUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/* =====================================================
   PROTECTED ROUTE
===================================================== */
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return element;
};

/* =====================================================
   NAV
===================================================== */
const Nav = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <nav className="p-4 bg-gray-100 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-black">
          CogitoSphere
        </Link>
        <span className="text-gray-700">Hello, {user.name}</span>
      </div>
    </nav>
  );
};

/* =====================================================
   LOGIN (DISABLED IN DEV MODE)
===================================================== */
const Login = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/home" replace />;

  return (
    <div className="p-10 text-center text-xl">
      Login disabled (DEV MODE)
    </div>
  );
};

/* =====================================================
   HOME
===================================================== */
const Home = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome Home, {user.name}!
      </h1>

      <div className="bg-gray-50 p-6 rounded-xl border max-w-lg mx-auto">
        <p><b>Email:</b> {user.email}</p>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
    </div>
  );
};

/* =====================================================
   SETTINGS
===================================================== */
const SettingsPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
    <p className="text-gray-600">Settings placeholder.</p>
  </div>
);

/* =====================================================
   SMART REDIRECT
===================================================== */
const SmartRedirect = () => {
  const { loading } = useAuth();
  if (loading) return null;
  return <Navigate to="/home" replace />;
};

/* =====================================================
   APP
===================================================== */
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Router>
        <AuthProvider>
          <Nav />
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<SmartRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/home"
                element={<ProtectedRoute element={<Home />} />}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute element={<SettingsPlaceholder />} />}
              />
              <Route
                path="*"
                element={
                  <div className="text-center mt-20 text-red-500 text-2xl font-bold">
                    404 - Not Found
                  </div>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}
