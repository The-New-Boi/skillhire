import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("candidate"), // 'candidate' | 'recruiter'
  name: text("name").notNull(),
  bio: text("bio"),
  skills: text("skills").array(),
  experienceYears: integer("experience_years"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  recruiterId: integer("recruiter_id").notNull(), // Foreign key to users.id
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(), // Foreign key to companies.id
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  salaryRange: text("salary_range"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillChecks = pgTable("skill_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users.id
  field: text("field").notNull(), // e.g., 'React', 'Python', 'Data Science'
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(), // Foreign key to jobs.id
  userId: integer("user_id").notNull(), // Foreign key to users.id
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
  testScore: integer("test_score"), // Score from the specific test for this job application (if any)
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertSkillCheckSchema = createInsertSchema(skillChecks).omit({ id: true, createdAt: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, createdAt: true });

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema;

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type SkillCheck = typeof skillChecks.$inferSelect;
export type InsertSkillCheck = z.infer<typeof insertSkillCheckSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type AuthResponse = {
  token: string;
  user: User;
};

export type TestQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
};

export type GenerateTestRequest = {
  field: string;
  difficulty: "easy" | "medium" | "hard";
};

export type TestResultRequest = {
  field: string;
  answers: { questionId: number; selectedOption: number }[];
  questions: TestQuestion[]; // Send back questions to verify answers server-side (simplification)
};

export type TestResultResponse = {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
};

export * from "./models/chat";
