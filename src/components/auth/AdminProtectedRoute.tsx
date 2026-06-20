import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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


