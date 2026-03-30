import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, TrendingUp, Award } from "lucide-react";

const authFetch = async (url: string) => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

function useLeaderboard() {
  return useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: () => authFetch("/api/leaderboard"),
  });
}

export default function Leaderboard() {
  const { data: leaders, isLoading } = useLeaderboard();

  const podiumColors = [
    { bg: "from-yellow-500/30 to-amber-500/30", border: "border-yellow-500/50", text: "text-yellow-400", icon: Crown },
    { bg: "from-gray-300/20 to-gray-400/20", border: "border-gray-400/50", text: "text-gray-300", icon: Medal },
    { bg: "from-amber-700/20 to-orange-700/20", border: "border-amber-700/50", text: "text-amber-600", icon: Medal },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold font-display text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">Top candidates ranked by verified skill scores</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-card/50 rounded-xl animate-pulse" />)}
          </div>
        ) : leaders && leaders.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              {/* 2nd Place */}
              {leaders.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <PodiumCard leader={leaders[1]} rank={2} colors={podiumColors[1]} />
                </motion.div>
              )}
              
              {/* 1st Place */}
              {leaders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <PodiumCard leader={leaders[0]} rank={1} colors={podiumColors[0]} />
                </motion.div>
              )}

              {/* 3rd Place */}
              {leaders.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12"
                >
                  <PodiumCard leader={leaders[2]} rank={3} colors={podiumColors[2]} />
                </motion.div>
              )}
            </motion.div>

            {/* Rest of the leaderboard */}
            {leaders.length > 3 && (
              <div className="space-y-2">
                {leaders.slice(3).map((leader: any, i: number) => (
                  <motion.div
                    key={leader.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <Card className={`glass-card transition-all ${leader.isHighlighted ? 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/5 ring-1 ring-yellow-500/50' : 'border-white/5 hover:border-white/10'}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="text-lg font-bold font-mono text-muted-foreground w-8 text-center">
                          #{i + 4}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <span className="font-bold text-white text-sm">
                            {leader.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-white flex items-center gap-2">
                            {leader.name}
                            {leader.isHighlighted && <Crown size={14} className="text-yellow-500" />}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">@{leader.username}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{leader.totalTests} tests</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-white/10">
                            <Award size={10} className="mr-1" /> {leader.passedCount}
                          </Badge>
                          <span className="font-mono font-bold text-primary text-lg">{leader.avgScore}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10"
          >
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Be the first to take a skill assessment!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ leader, rank, colors }: { leader: any; rank: number; colors: any }) {
  const Icon = colors.icon;
  return (
    <Card className={`glass-card border ${colors.border} overflow-hidden`}>
      <CardContent className={`p-4 text-center bg-gradient-to-b ${colors.bg}`}>
        <div className="relative mb-3">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center border-2 ${colors.border}`}>
            <span className="text-xl font-bold text-white">{leader.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-700"} flex items-center justify-center`}>
            <span className="text-[10px] font-bold text-white">{rank}</span>
          </div>
        </div>
        <Icon size={16} className={`${colors.text} mx-auto mb-1`} />
        <h3 className="font-bold text-white text-sm truncate">{leader.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">@{leader.username}</p>
        <div className={`text-2xl font-bold font-mono ${colors.text}`}>{leader.avgScore}%</div>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-[10px] text-muted-foreground">{leader.totalTests} tests</span>
          <span className="text-[10px] text-muted-foreground">•</span>
          <span className="text-[10px] text-muted-foreground">{leader.passedCount} passed</span>
        </div>
      </CardContent>
    </Card>
  );
}
