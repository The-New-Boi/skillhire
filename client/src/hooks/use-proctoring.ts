import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useProctoring(active: boolean = false) {
  const [flags, setFlags] = useState(0);
  const { toast } = useToast();

  const addFlag = useCallback((reason: string) => {
    setFlags((prev) => {
      const newCount = prev + 1;
      toast({
        title: "⚠️ Proctoring Warning",
        description: `${reason} detected! Incident logged (${newCount}).`,
        variant: "destructive",
      });
      return newCount;
    });
  }, [toast]);

  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addFlag("Tab switch");
      }
    };

    const handleBlur = () => {
      addFlag("Window blur");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addFlag("Exited fullscreen");
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Try to enter fullscreen if not already in it
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Failing to enter fullscreen is common if not triggered by user interaction
        // during the first render, so we just log it silently
      });
    }

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [active, addFlag]);

  return { flags, resetFlags: () => setFlags(0) };
}
