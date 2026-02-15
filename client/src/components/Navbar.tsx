import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { LogOut, LayoutDashboard, Briefcase, PlusCircle, Layers, User } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={user?.role === "recruiter" ? "/recruiter" : "/dashboard"} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <span className="font-bold text-white font-display">S</span>
              </div>
              <span className="text-xl font-bold font-display tracking-wider text-white">
                SkillHire<span className="text-primary">.AI</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {user?.role === "candidate" && (
                <>
                  <Link href="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/dashboard" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link href="/jobs" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/jobs" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                    <Briefcase size={18} />
                    Jobs
                  </Link>
                </>
              )}

              {user?.role === "recruiter" && (
                <>
                  <Link href="/recruiter" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/recruiter" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link href="/jobs/create" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/jobs/create" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                    <PlusCircle size={18} />
                    Post Job
                  </Link>
                  <Link href="/applications" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/applications" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                    <Layers size={18} />
                    Applications
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <User size={14} />
              <span className="font-medium text-white">{user?.username}</span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-primary/20 text-primary uppercase font-bold tracking-wider">
                {user?.role}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
