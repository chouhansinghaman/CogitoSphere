import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* Logged-in users only */
export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/* Admin-only */
export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
