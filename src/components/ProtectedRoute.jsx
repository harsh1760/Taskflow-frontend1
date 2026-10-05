import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ admin = false, allowAdmin = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (admin && user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!admin && !allowAdmin && user?.role === "admin") return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function AuthLoading({ children }) { return children; }