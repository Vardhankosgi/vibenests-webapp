import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function UserProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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


