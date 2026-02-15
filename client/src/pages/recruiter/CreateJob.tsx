import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateJob, useCompanies } from "@/hooks/use-jobs";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

// Extend schema for form handling (requirements as comma-separated string)
const formSchema = insertJobSchema.extend({
  requirements: z.string().transform(str => str.split(',').map(s => s.trim())),
  salaryRange: z.string().optional(),
});

type FormData = z.input<typeof formSchema>;

export default function CreateJob() {
  const [_, setLocation] = useLocation();
  const { data: companies } = useCompanies();
  const createJob = useCreateJob();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      salaryRange: "",
      isActive: true
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createJob.mutateAsync({
        ...data,
        requirements: data.requirements.split(',').map(s => s.trim()).filter(Boolean),
        companyId: Number(data.companyId)
      });
      setLocation("/recruiter");
    } catch (e) {}
  };

  if (!companies?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-bold mb-4">No Company Found</h2>
          <p className="text-muted-foreground mb-6">You need to create a company profile before posting jobs.</p>
          <Button onClick={() => setLocation("/recruiter")} className="btn-primary">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation("/recruiter")} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
        </Button>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Post New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="input-field">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-white/10">
                          {companies.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior React Developer" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the role responsibilities..." {...field} className="input-field min-h-[150px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="React, TypeScript, Node.js" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="$100k - $150k" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full btn-primary" disabled={createJob.isPending}>
                  {createJob.isPending ? "Posting..." : "Publish Job"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
