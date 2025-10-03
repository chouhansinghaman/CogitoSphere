// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute, AdminRoute } from "./routes/Guards.jsx";

// --- Pages ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/not found/NotFound.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Courses (any logged-in user can view) */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />

          {/* Admin-only Routes */}
          <Route
            path="/create-course"
            element={
              <AdminRoute>
                <CreateCourse />
              </AdminRoute>
            }
          />
          <Route
            path="/edit-course/:id"
            element={
              <AdminRoute>
                <EditCourse />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
