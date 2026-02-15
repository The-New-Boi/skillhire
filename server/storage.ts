import { users, companies, jobs, skillChecks, jobApplications, conversations, messages } from "@shared/schema";
import { insertUserSchema, insertCompanySchema, insertJobSchema, insertSkillCheckSchema, insertJobApplicationSchema } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<typeof users.$inferSelect | undefined>;
  getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(user: typeof insertUserSchema._type): Promise<typeof users.$inferSelect>;

  getCompanies(): Promise<typeof companies.$inferSelect[]>;
  getCompany(id: number): Promise<typeof companies.$inferSelect | undefined>;
  createCompany(company: typeof insertCompanySchema._type): Promise<typeof companies.$inferSelect>;

  getJobs(): Promise<(typeof jobs.$inferSelect & { company: typeof companies.$inferSelect })[]>;
  getJob(id: number): Promise<(typeof jobs.$inferSelect & { company: typeof companies.$inferSelect }) | undefined>;
  createJob(job: typeof insertJobSchema._type): Promise<typeof jobs.$inferSelect>;

  getSkillChecks(userId: number): Promise<typeof skillChecks.$inferSelect[]>;
  createSkillCheck(skillCheck: typeof insertSkillCheckSchema._type): Promise<typeof skillChecks.$inferSelect>;
  
  getJobApplications(userId?: number, recruiterId?: number): Promise<(typeof jobApplications.$inferSelect & { job: typeof jobs.$inferSelect, user: typeof users.$inferSelect })[]>;
  createJobApplication(application: typeof insertJobApplicationSchema._type): Promise<typeof jobApplications.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: typeof insertUserSchema._type): Promise<typeof users.$inferSelect> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCompanies(): Promise<typeof companies.$inferSelect[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<typeof companies.$inferSelect | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(insertCompany: typeof insertCompanySchema._type): Promise<typeof companies.$inferSelect> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async getJobs(): Promise<(typeof jobs.$inferSelect & { company: typeof companies.$inferSelect })[]> {
    const results = await db.select().from(jobs).innerJoin(companies, eq(jobs.companyId, companies.id));
    return results.map(r => ({ ...r.jobs, company: r.companies }));
  }

  async getJob(id: number): Promise<(typeof jobs.$inferSelect & { company: typeof companies.$inferSelect }) | undefined> {
    const [result] = await db.select().from(jobs).innerJoin(companies, eq(jobs.companyId, companies.id)).where(eq(jobs.id, id));
    if (!result) return undefined;
    return { ...result.jobs, company: result.companies };
  }

  async createJob(insertJob: typeof insertJobSchema._type): Promise<typeof jobs.$inferSelect> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async getSkillChecks(userId: number): Promise<typeof skillChecks.$inferSelect[]> {
    return await db.select().from(skillChecks).where(eq(skillChecks.userId, userId)).orderBy(desc(skillChecks.createdAt));
  }

  async createSkillCheck(insertSkillCheck: typeof insertSkillCheckSchema._type): Promise<typeof skillChecks.$inferSelect> {
    const [check] = await db.insert(skillChecks).values(insertSkillCheck).returning();
    return check;
  }

  async getJobApplications(userId?: number, recruiterId?: number): Promise<(typeof jobApplications.$inferSelect & { job: typeof jobs.$inferSelect, user: typeof users.$inferSelect })[]> {
    let query = db.select({
      application: jobApplications,
      job: jobs,
      user: users,
      company: companies
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .innerJoin(users, eq(jobApplications.userId, users.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id));

    if (userId) {
      // @ts-ignore
      query = query.where(eq(jobApplications.userId, userId));
    } else if (recruiterId) {
      // @ts-ignore
      query = query.where(eq(companies.recruiterId, recruiterId));
    }
    
    // @ts-ignore
    const results = await query;
    return results.map(r => ({
      ...r.application,
      job: r.job,
      user: r.user
    }));
  }

  async createJobApplication(insertApplication: typeof insertJobApplicationSchema._type): Promise<typeof jobApplications.$inferSelect> {
    const [app] = await db.insert(jobApplications).values(insertApplication).returning();
    return app;
  }
}

export const storage = new DatabaseStorage();
