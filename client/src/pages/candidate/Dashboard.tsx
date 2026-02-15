import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSkillChecks } from "@/hooks/use-skills";
import { useJobs } from "@/hooks/use-jobs";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Award, Briefcase, Zap, CheckCircle2, XCircle } from "lucide-react";
import { TestModal } from "@/components/TestModal";
import { Link } from "wouter";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: skillChecks, isLoading: skillsLoading } = useSkillChecks();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Recommended jobs based on passed skill checks
  const passedSkills = skillChecks?.filter(s => s.passed).map(s => s.field.toLowerCase()) || [];
  const recommendedJobs = jobs?.filter(job => 
    job.requirements?.some(req => passedSkills.includes(req.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground">Ready to prove your skills and land your dream job?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Skill Score</p>
                <h3 className="text-3xl font-bold text-white font-display">
                  {skillChecks?.length ? Math.round(skillChecks.reduce((acc, curr) => acc + curr.score, 0) / skillChecks.length) : 0}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="text-primary w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary mb-1">Badges Earned</p>
                <h3 className="text-3xl font-bold text-white font-display">
                  {skillChecks?.filter(s => s.passed).length || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Award className="text-secondary w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent mb-1">Job Matches</p>
                <h3 className="text-3xl font-bold text-white font-display">
                  {recommendedJobs.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Briefcase className="text-accent w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Skill Checks Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Zap className="text-yellow-400" size={20} />
                Skill Validations
              </h2>
              <Button onClick={() => setIsTestModalOpen(true)} className="btn-primary">
                Take New Test
              </Button>
            </div>

            {skillsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-card/50 rounded-xl animate-pulse" />)}
              </div>
            ) : (skillChecks?.length ?? 0) > 0 ? (
              <div className="grid gap-4">
                {skillChecks?.map((check) => (
                  <motion.div 
                    key={check.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="glass-card border-l-4 border-l-primary hover:border-l-secondary transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{check.field}</h3>
                            <p className="text-sm text-muted-foreground">Completed on {new Date(check.createdAt!).toLocaleDateString()}</p>
                          </div>
                          {check.passed ? (
                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50">
                              <CheckCircle2 size={14} className="mr-1" /> Passed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">
                              <XCircle size={14} className="mr-1" /> Failed
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Proficiency Score</span>
                            <span className="font-mono font-bold">{check.score}%</span>
                          </div>
                          <Progress value={check.score} className="h-2 bg-white/10" indicatorClassName={check.passed ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-red-500"} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No skills verified yet</h3>
                <p className="text-muted-foreground mb-6">Take an AI-generated test to prove your skills.</p>
                <Button onClick={() => setIsTestModalOpen(true)} className="btn-secondary">Start Assessment</Button>
              </div>
            )}
          </div>

          {/* Recommended Jobs Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Briefcase className="text-blue-400" size={20} />
              Recommended For You
            </h2>
            
            {jobsLoading ? (
              <div className="h-64 bg-card/50 rounded-xl animate-pulse" />
            ) : recommendedJobs.length > 0 ? (
              <div className="space-y-4">
                {recommendedJobs.map(job => (
                  <Card key={job.id} className="glass-card hover:bg-white/5 transition-colors cursor-pointer group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold text-white group-hover:text-primary transition-colors">{job.title}</CardTitle>
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">{job.salaryRange}</Badge>
                      </div>
                      <CardDescription className="text-xs truncate">{job.company?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.requirements?.slice(0, 3).map((req, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                            {req}
                          </span>
                        ))}
                      </div>
                      <Button asChild size="sm" className="w-full mt-4 bg-white/5 hover:bg-primary hover:text-white transition-all text-xs h-8">
                        <Link href={`/jobs`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-white/5 rounded-xl">
                <p className="text-sm text-muted-foreground">Pass skill checks to unlock job recommendations.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <TestModal open={isTestModalOpen} onOpenChange={setIsTestModalOpen} />
    </div>
  );
}
