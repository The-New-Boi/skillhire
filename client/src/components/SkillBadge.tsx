import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Award } from "lucide-react";

interface SkillBadgeProps {
  field: string;
  score: number;
  passed: boolean;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function SkillBadge({ field, score, passed, size = "md", showScore = true }: SkillBadgeProps) {
  const getColor = () => {
    if (score >= 80) return { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/40", text: "text-green-400", glow: "shadow-green-500/20" };
    if (score >= 60) return { bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/40", text: "text-yellow-400", glow: "shadow-yellow-500/20" };
    return { bg: "from-red-500/20 to-rose-500/20", border: "border-red-500/40", text: "text-red-400", glow: "shadow-red-500/20" };
  };

  const color = getColor();

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSize = { sm: 10, md: 14, lg: 18 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        inline-flex items-center rounded-full border bg-gradient-to-r
        ${color.bg} ${color.border} ${sizeClasses[size]}
        cursor-default transition-shadow duration-300
        hover:shadow-lg ${color.glow}
      `}
    >
      {passed ? (
        <CheckCircle2 size={iconSize[size]} className={color.text} />
      ) : (
        <XCircle size={iconSize[size]} className={color.text} />
      )}
      <span className={`font-medium ${color.text}`}>{field}</span>
      {showScore && (
        <span className={`font-mono font-bold text-[0.7em] opacity-70 ${color.text}`}>
          {score}%
        </span>
      )}
    </motion.div>
  );
}

interface SkillBadgeGridProps {
  skills: Array<{ field: string; score: number; passed: boolean }>;
  size?: "sm" | "md" | "lg";
}

export function SkillBadgeGrid({ skills, size = "md" }: SkillBadgeGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, i) => (
        <motion.div
          key={skill.field}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <SkillBadge {...skill} size={size} />
        </motion.div>
      ))}
      {skills.length === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
          <Award size={16} />
          <span>No skills verified yet</span>
        </div>
      )}
    </div>
  );
}
