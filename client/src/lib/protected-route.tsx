import { useAuth } from "./auth-context";
import { Redirect, Route } from "wouter";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: () => ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Route path={path} component={() => <Redirect to="/login" />} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if role doesn't match
    const redirectPath = user.role === "recruiter" ? "/recruiter" : "/dashboard";
    return <Route path={path} component={() => <Redirect to={redirectPath} />} />;
  }

  return <Route path={path} component={Component} />;
}
