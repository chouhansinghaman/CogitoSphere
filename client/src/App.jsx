import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

// --- Import Public Pages ---
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// --- Import Private Pages ---
import Home from "./pages/home/Home.jsx";
import Courses from "./pages/courses/Courses.jsx";
import CourseDetail from "./pages/courses/CourseDetail.jsx";
import Community from "./pages/community/Community.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Quizzes from "./pages/quizzes/Quizzes.jsx";
import TakeQuiz from "./pages/quizzes/TakeQuiz.jsx";
import Leaderboard from "./pages/leaderboard/Leaderboard.jsx";

// --- Import Admin-specific Pages ---
import CourseCreate from "./pages/courses/CourseCreate.jsx";
import CourseEdit from "./pages/courses/CourseEdit.jsx";
import QuizCreate from "./pages/quizzes/QuizCreate.jsx";
import QuizEdit from "./pages/quizzes/QuizEdit.jsx";
import QuestionCreate from "./pages/questions/QuestionCreate.jsx";

// --- Import Route Guards & Layout ---
import { PrivateRoute, AdminRoute } from "./routes/Guards.jsx";
import PrivateLayout from "./routes/PrivateLayout.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* --- Public Routes --- */}
          {/* The root path now renders your new main page */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* --- Private Routes with Shared Layout (for logged-in users) --- */}
          <Route
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          >
            {/* User-facing routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quiz/:id" element={<TakeQuiz />} />
            <Route path="/community" element={<Community />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin-only routes */}
            <Route
              path="/create-course"
              element={<AdminRoute><CourseCreate /></AdminRoute>}
            />
            <Route
              path="/edit-course/:courseId"
              element={<AdminRoute><CourseEdit /></AdminRoute>}
            />
            <Route
              path="/quizzes/create"
              element={<AdminRoute><QuizCreate /></AdminRoute>}
            />
            <Route
              path="/quizzes/edit/:quizId"
              element={<AdminRoute><QuizEdit /></AdminRoute>}
            />
            <Route
              path="/questions/create/:quizId"
              element={<AdminRoute><QuestionCreate /></AdminRoute>}
            />
            <Route
              path="/questions/create"
              element={<AdminRoute><QuestionCreate /></AdminRoute>}
            />
          </Route>

          {/* Catch-all route now redirects to the main landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
