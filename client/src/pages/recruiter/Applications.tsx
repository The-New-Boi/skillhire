import { useAuth } from "@/lib/auth-context";
import { useApplications } from "@/hooks/use-jobs";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Layers, CheckCircle, XCircle, Clock, User, Briefcase, FileText, TrendingUp, Crown } from "lucide-react";

// Auth fetch helper
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res;
};

function useUpdateStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await authFetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({ title: "Status Updated", description: `Application ${vars.status}` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export default function Applications() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useApplications();
  const updateStatus = useUpdateStatus();

  const statusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle size={14} className="text-green-400" />;
      case "rejected": return <XCircle size={14} className="text-red-400" />;
      case "hired": return <Crown size={14} className="text-yellow-500" />;
      default: return <Clock size={14} className="text-amber-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "rejected": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "hired": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-display text-white mb-2 flex items-center gap-3">
            <Layers className="text-primary" />
            Applications
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "recruiter" ? "Review and manage candidate applications" : "Track your job applications"}
          </p>
        </motion.div>

        {/* Stats Row */}
        {applications && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{applications.filter(a => a.status === "pending").length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{applications.filter(a => a.status === "accepted").length}</div>
                <div className="text-xs text-muted-foreground">Accepted</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{applications.filter(a => a.status === "rejected").length}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Application Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card/50 rounded-xl animate-pulse" />)}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-white/5 hover:border-white/10 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                          {app.user?.profileImage ? (
                            <img src={app.user.profileImage} alt={app.user.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {app.user?.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{app.user?.name || "Unknown"}</span>
                            <Badge variant="outline" className={`text-[10px] border ${statusColor(app.status)} capitalize`}>
                              {statusIcon(app.status)}
                              <span className="ml-1">{app.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} /> {app.job?.title}
                            </span>
                            {app.testScore !== undefined && app.testScore !== null && (
                              <Badge className={`${app.testScore >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'} border-none flex items-center gap-1 h-5 text-[10px]`}>
                                <TrendingUp size={10} /> Skill Match: {app.testScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Actions & Links */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Resume View */}
                        {app.resumeUrl && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-primary hover:text-primary/80 h-auto p-0 flex items-center gap-1 text-xs"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<iframe src="${app.resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            }}
                          >
                            <FileText size={12} /> View Resume
                          </Button>
                        )}
                      {user?.role === "recruiter" && app.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 h-7 text-[10px] px-2"
                            onClick={() => updateStatus.mutate({ id: app.id, status: "accepted" })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle size={10} className="mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 h-7 text-[10px] px-2"
                            onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle size={10} className="mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {user?.role === "recruiter" && app.status === "accepted" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-yellow-500 text-yellow-950 hover:bg-yellow-400 h-8 text-xs font-bold shadow-lg shadow-yellow-500/20"
                            onClick={() => {
                               alert("🎉 Candidate Hired! \n\nA success fee invoice of $500 has been sent to your email.");
                               updateStatus.mutate({ id: app.id, status: "hired" });
                            }}
                            disabled={updateStatus.isPending}
                          >
                            <Crown size={14} className="mr-1.5" /> Hire & Generate Invoice
                          </Button>
                        </div>
                      )}
                      </div>

                      {/* Status for candidates */}
                      {user?.role === "candidate" && app.status !== "pending" && (
                        <Badge className={`${statusColor(app.status)} capitalize text-xs`}>
                          {statusIcon(app.status)}
                          <span className="ml-1">{app.status}</span>
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10"
          >
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              {user?.role === "recruiter" ? "Applications will appear here when candidates apply." : "Apply to jobs to track your applications here."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
