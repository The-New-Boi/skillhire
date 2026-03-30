import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/lib/auth-context";

export function UpgradeModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Upgraded to PRO! 🎉",
        description: "You now have access to all premium features.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Upgrade Failed",
        description: "Something went wrong while upgrading your account.",
        variant: "destructive"
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock the full potential of SkillHire.AI and supercharge your career.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <h3 className="font-bold text-lg mb-2">Pro Tier Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited AI Skill Assessments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Detailed AI Feedback on Tests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited Job Postings (Recruiters)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Golden Profile Highlight in Leaderboard</span>
              </li>
            </ul>
            <div className="mt-6 font-bold text-3xl">
              $99<span className="text-sm text-muted-foreground font-normal">/month</span>
            </div>
          </div>
        </div>

        <Button 
          className="w-full text-lg h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 transition-all duration-300" 
          onClick={() => upgradeMutation.mutate()}
          disabled={upgradeMutation.isPending}
        >
          {upgradeMutation.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
          ) : (
            "Upgrade Now (Mock)"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
