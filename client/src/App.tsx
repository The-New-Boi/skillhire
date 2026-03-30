import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/Navbar";

// Pages
import LoginPage from "@/pages/auth/Login";
import CandidateDashboard from "@/pages/candidate/Dashboard";
import JobsPage from "@/pages/candidate/JobsPage";
import Profile from "@/pages/candidate/Profile";
import Leaderboard from "@/pages/candidate/Leaderboard";
import RecruiterDashboard from "@/pages/recruiter/Dashboard";
import CreateJob from "@/pages/recruiter/CreateJob";
import Applications from "@/pages/recruiter/Applications";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/login" component={LoginPage} />
        
        {/* Candidate Routes */}
        <ProtectedRoute path="/dashboard" component={CandidateDashboard} allowedRoles={["candidate"]} />
        <ProtectedRoute path="/jobs" component={JobsPage} allowedRoles={["candidate"]} />
        <ProtectedRoute path="/profile" component={Profile} allowedRoles={["candidate"]} />
        <ProtectedRoute path="/leaderboard" component={Leaderboard} allowedRoles={["candidate"]} />

        {/* Recruiter Routes */}
        <ProtectedRoute path="/recruiter" component={RecruiterDashboard} allowedRoles={["recruiter"]} />
        <ProtectedRoute path="/jobs/create" component={CreateJob} allowedRoles={["recruiter"]} />
        <ProtectedRoute path="/applications" component={Applications} allowedRoles={["recruiter"]} />

        {/* Default Redirect */}
        <Route path="/">
          <Redirect to="/login" />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
