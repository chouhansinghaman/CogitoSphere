import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Questions from "./pages/questions/Questions.jsx";
import NewQuestion from "./pages/questions/NewQuestion.jsx";
import Quizzes from "./pages/quizzes/Quizzes.jsx";
import TakeQuiz from "./pages/quizzes/TakeQuiz.jsx";
import NewQuiz from "./pages/quizzes/NewQuiz.jsx";
import Leaderboard from "./pages/leaderboard/Leaderboard.jsx";
import Community from "./pages/community/Community.jsx";
import AdminQuizzes from "./pages/admin/AdminQuizzes.jsx";

import { PrivateRoute, AdminRoute } from "./routes/Guards.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private */}
          <Route
            path="/questions"
            element={
              <PrivateRoute>
                <Questions />
              </PrivateRoute>
            }
          />
          <Route
            path="/questions/new"
            element={
              <AdminRoute>
                <NewQuestion />
              </AdminRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <PrivateRoute>
                <Quizzes />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <PrivateRoute>
                <TakeQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <AdminQuizzes />
              </AdminRoute>
            }
          />

          <Route
            path="/quizzes/new"
            element={
              <AdminRoute>
                <NewQuiz />
              </AdminRoute>
            }
          />


          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
