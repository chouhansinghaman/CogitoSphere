import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children }) => {
  const { token } = useAuth();

  // If auth context didn't load yet, show nothing instead of crashing
  if (token === undefined) return null;

  return token ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (token === undefined) return null; // context not ready

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};
