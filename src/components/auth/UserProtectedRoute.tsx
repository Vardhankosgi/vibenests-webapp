import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function UserProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // If tokens exist, refresh-started session validation; wait instead of redirecting.
    if (localStorage.getItem('accessToken') && localStorage.getItem('authUser')) return null;
    return <Navigate to="/login" replace />;
  }


  // If admin tries to open user dashboard pages
  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}


