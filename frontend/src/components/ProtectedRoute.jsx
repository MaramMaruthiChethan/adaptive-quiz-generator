import { Navigate } from "react-router-dom";
import { getStoredUser, isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
