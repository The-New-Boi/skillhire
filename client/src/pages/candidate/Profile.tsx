import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSkillChecks } from "@/hooks/use-skills";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SkillBadgeGrid } from "@/components/SkillBadge";
import { useToast } from "@/hooks/use-toast";
import { User, Brain, Award, TrendingUp, Calendar, Briefcase, Camera, Upload } from "lucide-react";

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { data: skillChecks, isLoading } = useSkillChecks();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const passedCount = skillChecks?.filter(s => s.passed).length || 0;
  const totalTests = skillChecks?.length || 0;
  const avgScore = totalTests > 0
    ? Math.round(skillChecks!.reduce((acc, curr) => acc + curr.score, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...skillChecks!.map(s => s.score)) : 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await authFetch("/api/profile/image", {
          method: "POST",
          body: JSON.stringify({ image: base64 }),
        });
        if (res.ok) {
          toast({ title: "Success!", description: "Profile picture updated" });
          // Refresh user data
          if (refreshUser) await refreshUser();
          else window.location.reload();
        } else {
          toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10"
        >
          {/* Banner */}
          <div className="h-36 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border border-white/10 overflow-hidden">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0djEyaDE0VjE0SDM2ek0xNCAzNnYxMmgxMlYzNkgxNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-14 left-8">
            <div 
              className="relative w-28 h-28 rounded-2xl border-4 border-background shadow-2xl overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-4xl font-bold font-display text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Upload className="text-white animate-bounce" size={24} />
                ) : (
                  <Camera className="text-white" size={24} />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-10 mb-10 pl-2"
        >
          <h1 className="text-3xl font-bold font-display text-white mb-1">{user?.name}</h1>
          <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
            <User size={14} /> @{user?.username}
            {user?.experienceYears && (
              <>
                <span className="text-white/20">•</span>
                <Calendar size={14} />
                {user.experienceYears} years experience
              </>
            )}
          </p>
          {user?.bio && (
            <p className="text-gray-300 text-sm max-w-xl leading-relaxed">{user.bio}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Camera size={10} /> Click your photo to change it
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: "Tests Taken", value: totalTests, icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Badges Earned", value: passedCount, icon: Award, color: "text-green-400", bg: "bg-green-400/10" },
            { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-400/10" },
            { label: "Best Score", value: `${bestScore}%`, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card className="glass-card border-white/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-display text-white">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Skill Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <Award className="text-yellow-400" size={20} />
            Verified Skills
          </h2>
          {isLoading ? (
            <div className="h-16 bg-card/50 rounded-xl animate-pulse" />
          ) : (
            <SkillBadgeGrid 
              skills={skillChecks?.map(s => ({ field: s.field, score: s.score, passed: s.passed })) || []} 
              size="lg"
            />
          )}
        </motion.div>

        {/* Skill Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <Brain className="text-blue-400" size={20} />
            Skill Breakdown
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card/50 rounded-xl animate-pulse" />)}
            </div>
          ) : skillChecks && skillChecks.length > 0 ? (
            <div className="space-y-3">
              {skillChecks.map((check, i) => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Card className="glass-card border-white/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{check.field}</span>
                          {check.passed ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">PASSED</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">FAILED</span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-sm text-white">{check.score}%</span>
                      </div>
                      <Progress 
                        value={check.score} 
                        className="h-2 bg-white/10" 
                        indicatorClassName={
                          check.score >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                          check.score >= 60 ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
                          "bg-gradient-to-r from-red-500 to-rose-400"
                        } 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed {new Date(check.createdAt!).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-dashed border-white/10">
              <CardContent className="p-8 text-center">
                <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Take skill assessments to build your profile.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
