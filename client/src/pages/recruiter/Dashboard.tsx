import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useApplications, useJobs, useCompanies, useCreateCompany, useCreateJob } from "@/hooks/use-jobs";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Briefcase, Building2, Plus } from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: applications, isLoading: appsLoading } = useApplications();
  const { data: jobs } = useJobs();
  const { data: companies } = useCompanies();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold font-display text-white mb-2">
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground">Manage jobs and view top talent.</p>
          </div>
          <div className="flex gap-4">
            <CreateCompanyDialog />
            <Link href="/jobs/create">
              <Button className="btn-primary gap-2">
                <Plus size={16} /> Post Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                <h3 className="text-3xl font-bold text-white font-display">{applications?.length || 0}</h3>
              </div>
              <Users className="text-primary w-8 h-8 opacity-50" />
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
                <h3 className="text-3xl font-bold text-white font-display">{jobs?.filter(j => j.isActive).length || 0}</h3>
              </div>
              <Briefcase className="text-secondary w-8 h-8 opacity-50" />
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Companies</p>
                <h3 className="text-3xl font-bold text-white font-display">{companies?.length || 0}</h3>
              </div>
              <Building2 className="text-accent w-8 h-8 opacity-50" />
            </CardContent>
          </Card>
        </div>

        {/* Applicants List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white">Recent Applications</h2>
          
          <div className="bg-card/30 backdrop-blur rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-5 p-4 text-sm font-medium text-muted-foreground bg-white/5">
              <div className="col-span-1">Candidate</div>
              <div className="col-span-1">Job Role</div>
              <div className="col-span-1">Test Score</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            
            {appsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
            ) : applications?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No applications received yet.</div>
            ) : (
              applications?.map((app) => (
                <div key={app.id} className="grid grid-cols-5 p-4 items-center border-t border-white/5 hover:bg-white/5 transition-colors">
                  <div className="col-span-1 font-medium text-white">{app.user.name}</div>
                  <div className="col-span-1 text-sm text-gray-400">{app.job.title}</div>
                  <div className="col-span-1">
                    {app.testScore ? (
                      <Badge variant={app.testScore >= 70 ? "default" : "secondary"} className={app.testScore >= 70 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                        {app.testScore}%
                      </Badge>
                    ) : <span className="text-muted-foreground">-</span>}
                  </div>
                  <div className="col-span-1">
                    <Badge variant="outline" className="capitalize border-white/10 text-gray-400">{app.status}</Badge>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button variant="ghost" size="sm" className="h-8 hover:text-primary">View</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const createCompany = useCreateCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany.mutateAsync({ name, description: desc });
      setOpen(false);
      setName("");
      setDesc("");
    } catch (e) {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          Create Company
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Register New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Acme Corp" required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-field" placeholder="About the company..." required />
          </div>
          <Button type="submit" className="w-full btn-primary" disabled={createCompany.isPending}>
            {createCompany.isPending ? "Creating..." : "Create Company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
