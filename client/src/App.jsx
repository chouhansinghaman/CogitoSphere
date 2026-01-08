import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

/* Public pages */
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

/* Private pages */
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/home/Home.jsx";
import Courses from "./pages/courses/Courses.jsx";
import CourseDetail from "./pages/courses/CourseDetail.jsx";
import Community from "./pages/community/Community.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Quizzes from "./pages/quizzes/Quizzes.jsx";
import TakeQuiz from "./pages/quizzes/TakeQuiz.jsx";
import Leaderboard from "./pages/leaderboard/Leaderboard.jsx";
import PublicProfile from "./pages/public/PublicProfile.jsx";

/* Admin pages */
import CourseCreate from "./pages/courses/CourseCreate.jsx";
import CourseEdit from "./pages/courses/CourseEdit.jsx";
import QuizCreate from "./pages/quizzes/QuizCreate.jsx";
import QuizEdit from "./pages/quizzes/QuizEdit.jsx";
import QuestionCreate from "./pages/questions/QuestionCreate.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

/* Guards */
import { PrivateRoute, AdminRoute } from "./routes/Guards.jsx";
import RedirectHome from "./components/RedirectHome.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<RedirectHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Private */}
          <Route element={<PrivateRoute />}>
            {/* Sidebar layout */}
            <Route element={<Sidebar />}>
              <Route path="/home" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route path="/community" element={<Community />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* ✅ NEW PUBLIC PROFILE ROUTE */}
              <Route path="/u/:id" element={<PublicProfile />} />

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/create-course" element={<CourseCreate />} />
                <Route path="/edit-course/:id" element={<CourseEdit />} />
                
                {/* Quiz Management */}
                <Route path="/quizzes/create" element={<QuizCreate />} />
                <Route path="/quizzes/edit/:quizId" element={<QuizEdit />} />
                <Route path="/questions/create/:quizId" element={<QuestionCreate />} />
                <Route path="/questions/create" element={<QuestionCreate />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}