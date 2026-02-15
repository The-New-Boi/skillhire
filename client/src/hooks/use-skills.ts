import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Helper for auth headers
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
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  
  return res;
};

export function useSkillChecks() {
  return useQuery({
    queryKey: [api.skillChecks.list.path],
    queryFn: async () => {
      const res = await authFetch(api.skillChecks.list.path);
      if (!res.ok) throw new Error("Failed to fetch skill checks");
      return api.skillChecks.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateTest() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.skillChecks.generate.input>) => {
      const res = await authFetch(api.skillChecks.generate.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate test");
      return api.skillChecks.generate.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.skillChecks.submit.input>) => {
      const res = await authFetch(api.skillChecks.submit.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit test");
      return api.skillChecks.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skillChecks.list.path] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
