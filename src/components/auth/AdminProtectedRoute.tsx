import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

