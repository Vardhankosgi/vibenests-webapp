import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // During initial mount, AuthProvider validates session asynchronously.
  // Avoid redirecting to /login until validation has completed.
  if (!isAuthenticated) {
    // If we already have tokens in localStorage, user likely refresh-started and AuthProvider
    // is still validating. Do not redirect during that window.
    if (localStorage.getItem('accessToken') && localStorage.getItem('authUser')) return null;
    return <Navigate to="/login" replace />;
  }


  if (!user || user.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}


