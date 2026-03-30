import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useJobs, useApplyJob, useResumeCheck } from "@/hooks/use-jobs";
import { useSkillChecks } from "@/hooks/use-skills";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, DollarSign, CheckCircle2, Sparkles, Filter, FileText, Upload, X, Loader2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useJobs();
  const { data: skillChecks } = useSkillChecks();
  const applyJob = useApplyJob();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Apply Modal State
  const [selectedJob, setSelectedJob] = useState<{ id: number, title: string } | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [resumeResult, setResumeResult] = useState<{ matchScore: number, summary: string } | null>(null);

  const resumeCheck = useResumeCheck();

  // Get all unique skills/requirements across jobs
  const allSkills = useMemo(() => {
    if (!jobs) return [];
    const skills = new Set<string>();
    jobs.forEach(job => job.requirements?.forEach(r => skills.add(r)));
    return Array.from(skills).sort();
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters = activeFilters.length === 0 || 
        activeFilters.some(f => job.requirements?.map(r => r.toLowerCase()).includes(f.toLowerCase()));
      
      return matchesSearch && matchesFilters;
    });
  }, [jobs, searchQuery, activeFilters]);

  const passedSkills = skillChecks?.filter(s => s.passed).map(s => s.field.toLowerCase()) || [];

  const toggleFilter = (skill: string) => {
    setActiveFilters(prev => 
      prev.includes(skill) ? prev.filter(f => f !== skill) : [...prev, skill]
    );
  };

  const getBestScoreForRequirements = (requirements: string[] | null) => {
    if (!requirements || requirements.length === 0) return 100; // No requirements
    const relevantChecks = skillChecks?.filter(s => 
      requirements.map(r => r.toLowerCase()).includes(s.field.toLowerCase())
    ) || [];
    
    if (relevantChecks.length === 0) return 0;
    return Math.max(...relevantChecks.map(s => s.score));
  };

  const hasPassedRequirements = (requirements: string[] | null) => {
    return getBestScoreForRequirements(requirements) >= 70;
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" });
      return;
    }

    setResumeFileName(file.name);
    setResumeResult(null); // Reset result on new file
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAIResumeCheck = async () => {
    if (!resumeBase64 || !selectedJob) return;
    
    try {
      // For the demo, we'll just send a snippet or the whole base64 if it's small, 
      // but ideally we'd parse the text on client or server. 
      // Here we'll simulate text parsing by sending the filename + some dummy text for AI check
      const result = await resumeCheck.mutateAsync({
        resumeText: `Candidate Resume File: ${resumeFileName}. Content: [Simulated resume content analysis]`,
        jobId: selectedJob.id
      });
      setResumeResult(result);
    } catch (err) {
      // Error handled by hook
    }
  };

  const submitApplication = () => {
    if (selectedJob) {
      applyJob.mutate(
        { jobId: selectedJob.id, resumeUrl: resumeBase64 },
        { 
          onSuccess: () => {
             setSelectedJob(null);
             setResumeBase64("");
             setResumeFileName("");
          }
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-display text-white mb-2 flex items-center gap-3">
            <Briefcase className="text-primary" />
            Browse Jobs
          </h1>
          <p className="text-muted-foreground">Find your dream job and apply with verified skills</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search jobs by title, company, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl text-base focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </motion.div>

        {/* Skill Filter Chips */}
        {allSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Filter by skills:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleFilter(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    activeFilters.includes(skill)
                      ? "bg-primary/20 text-primary border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {skill}
                  {passedSkills.includes(skill.toLowerCase()) && (
                    <CheckCircle2 size={10} className="inline ml-1 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-white font-medium">{filteredJobs.length}</span> of {jobs?.length || 0} jobs
          </p>
          {activeFilters.length > 0 && (
            <button 
              onClick={() => setActiveFilters([])} 
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Job Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card border-white/5 hover:border-primary/30 transition-all duration-300 group h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {job.company?.name}
                          </CardDescription>
                        </div>
                        {hasPassedRequirements(job.requirements) && (
                          <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            <Sparkles size={12} />
                            <span className="text-[10px] font-bold">MATCH</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-0">
                      <div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{job.description}</p>
                        
                        {/* Requirements */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {job.requirements?.map((req, i) => (
                            <span 
                              key={i} 
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                passedSkills.includes(req.toLowerCase())
                                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                                  : "bg-white/5 text-gray-400 border-white/10"
                              }`}
                            >
                              {req}
                              {passedSkills.includes(req.toLowerCase()) && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        {job.salaryRange && (
                          <div className="flex items-center gap-1 text-sm text-green-400">
                            <DollarSign size={14} />
                            <span className="font-mono font-medium text-xs">{job.salaryRange}</span>
                          </div>
                        )}
                        <Button 
                          size="sm"
                          className="btn-primary text-xs h-8" 
                          onClick={() => {
                            setSelectedJob({ id: job.id, title: job.title });
                          }}
                          disabled={applyJob.isPending && selectedJob?.id === job.id}
                        >
                          {applyJob.isPending && selectedJob?.id === job.id ? "Applying..." : "Apply Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10"
          >
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Apply Job Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => {
        if (!open) {
          setSelectedJob(null);
          setResumeResult(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Briefcase className="text-primary w-5 h-5" />
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submit your application. Optional: Use AI Auto-Check to see your compatibility score.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && !hasPassedRequirements(jobs?.find(j => j.id === selectedJob.id)?.requirements || []) && (
            <div className="p-3 mb-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-[11px] text-red-400 flex items-center gap-2">
                <ShieldAlert size={14} />
                <strong>Skill Verification Required:</strong> You can check compatibility, but you need a 70% score in relevant skills to submit your application.
              </p>
            </div>
          )}
          
          <div className="py-6">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {resumeFileName ? (
                    <>
                      <FileText className="w-8 h-8 mb-3 text-primary" />
                      <p className="mb-2 text-sm text-gray-200 font-medium">{resumeFileName}</p>
                      <p className="text-xs text-gray-400">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-white transition-colors" />
                      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-primary">Click to upload</span> your resume</p>
                      <p className="text-xs text-slate-500">PDF, DOC, DOCX (MAX. 2MB)</p>
                    </>
                  )}
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeFileChange} />
              </label>
            </div>
            {resumeFileName && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 w-full" onClick={() => { setResumeFileName(""); setResumeBase64(""); setResumeResult(null); }}>
                <X className="w-3 h-3 justify-center mr-1"/> Remove File
              </Button>
            )}

            {resumeBase64 && !resumeResult && (
              <Button 
                onClick={handleAIResumeCheck} 
                disabled={resumeCheck.isPending}
                className="w-full mt-4 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs gap-2"
              >
                {resumeCheck.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Auto-Check Compatibility
              </Button>
            )}

            {resumeResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Sparkles size={12} /> AI Analysis
                  </span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    {resumeResult.matchScore}% Match
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed italic">
                  "{resumeResult.summary}"
                </p>
              </motion.div>
            )}
          </div>

          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5" onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button 
              className="btn-primary" 
              onClick={submitApplication} 
              disabled={applyJob.isPending || (selectedJob ? !hasPassedRequirements(jobs?.find(j => j.id === selectedJob.id)?.requirements || []) : true)}
            >
              {applyJob.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
