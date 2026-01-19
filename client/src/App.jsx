import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

/* Public pages */
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import LandingPage from "./pages/landing page/LandingPage.jsx";

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
import AddProject from "./pages/project/AddProject.jsx";
import ProjectDetails from "./pages/project/ProjectDetails.jsx";

/* Admin pages */
import CourseCreate from "./pages/courses/CourseCreate.jsx";
import CourseEdit from "./pages/courses/CourseEdit.jsx";
import QuizCreate from "./pages/quizzes/QuizCreate.jsx";
import QuizEdit from "./pages/quizzes/QuizEdit.jsx";
import QuestionCreate from "./pages/questions/QuestionCreate.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

/* Components & Guards */
import { PrivateRoute, AdminRoute } from "./routes/Guards.jsx";
import RedirectHome from "./components/RedirectHome.jsx";
import GridGlitchGame from "./components/GridGlitchGame.jsx";

export default function App() {
  // State for the "Server Wake Up" Game
  const [isServerAwake, setIsServerAwake] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  // 1. THE WAKE-UP LOGIC ⏰
  useEffect(() => {
    const checkServer = async () => {
      try {
        // 🚀 REAL: Replace with your actual simple GET endpoint (e.g. /api/health)
        // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
        // if (res.ok) setIsServerAwake(true);
        
        // 🕹️ SIMULATION: Fakes a 4-second boot up time
        setTimeout(() => {
          setIsServerAwake(true);
        }, 4000); 
        
      } catch (err) {
        console.error("Server is still sleeping...", err);
      }
    };

    checkServer();
  }, []);

  // 2. SHOW GAME IF NOT ENTERED YET
  if (!hasEnteredApp) {
    return (
      <GridGlitchGame 
        isServerReady={isServerAwake} 
        onEnterApp={() => setHasEnteredApp(true)} 
      />
    );
  }

  // 3. MAIN APP
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
          {/* If user is logged in, LandingPage will handle the redirect internally */}
          <Route path="/" element={<LandingPage />} />

          {/* A universal "check" path */}
          <Route path="/check" element={<RedirectHome />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>

            {/* 🛑 FOCUS MODE ROUTE (No Sidebar) 🛑 */}
            <Route path="/quiz/:id" element={<TakeQuiz />} />

            {/* 🟢 STANDARD LAYOUT ROUTES (With Sidebar) 🟢 */}
            <Route element={<Sidebar />}>
              <Route path="/home" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/community" element={<Community />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/add-project" element={<AddProject />} />
              <Route path="/u/:id" element={<PublicProfile />} />
              <Route path="/project/:id" element={<ProjectDetails />} />

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/create-course" element={<CourseCreate />} />
                <Route path="/edit-course/:id" element={<CourseEdit />} />
                <Route path="/quizzes/create" element={<QuizCreate />} />
                <Route path="/quizzes/edit/:quizId" element={<QuizEdit />} />
                <Route path="/questions/create/:quizId" element={<QuestionCreate />} />
                <Route path="/questions/create" element={<QuestionCreate />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/check" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}