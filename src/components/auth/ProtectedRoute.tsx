import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children ?? <Outlet />}</>;
}
