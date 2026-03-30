import { z } from 'zod';
import {
  insertUserSchema,
  insertCompanySchema,
  insertJobSchema,
  insertSkillCheckSchema,
  insertJobApplicationSchema,
  loginSchema,
  users,
  companies,
  jobs,
  skillChecks,
  jobApplications
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Custom schemas for specific endpoints
export const generateTestSchema = z.object({
  field: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const submitTestSchema = z.object({
  field: z.string(),
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOption: z.number(),
  })),
  questions: z.array(z.object({
    id: z.number(),
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
  })),
  cheatingFlags: z.number().optional().default(0),
});

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<{ token: string; user: typeof users.$inferSelect }>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: loginSchema,
      responses: {
        200: z.custom<{ token: string; user: typeof users.$inferSelect }>(),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:username' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  skillChecks: {
    list: {
      method: 'GET' as const,
      path: '/api/skill-checks' as const,
      responses: {
        200: z.array(z.custom<typeof skillChecks.$inferSelect>()),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/generate-test' as const,
      input: generateTestSchema,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number(),
        })),
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/submit-test' as const,
      input: submitTestSchema,
      responses: {
        200: z.object({
          score: z.number(),
          passed: z.boolean(),
          correctAnswers: z.number(),
          totalQuestions: z.number(),
        }),
      },
    },
  },
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies' as const,
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies' as const,
      input: insertCompanySchema.omit({ recruiterId: true }),
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs' as const,
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect & { company: typeof companies.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs' as const,
      input: insertJobSchema,
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/jobs/:id' as const,
      responses: {
        200: z.custom<typeof jobs.$inferSelect & { company: typeof companies.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    apply: {
      method: 'POST' as const,
      path: '/api/jobs/:id/apply' as const,
      responses: {
        200: z.custom<typeof jobApplications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  applications: {
    list: { // Recruiter views applications for their jobs, Candidate views their own
      method: 'GET' as const,
      path: '/api/applications' as const,
      responses: {
        200: z.array(z.custom<typeof jobApplications.$inferSelect & { job: typeof jobs.$inferSelect, user: typeof users.$inferSelect }>()),
      },
    },
  },
  resume: {
    check: {
      method: 'POST' as const,
      path: '/api/resume/check' as const,
      input: z.object({
        resumeText: z.string(),
        jobId: z.number(),
      }),
      responses: {
        200: z.object({
          matchScore: z.number(),
          summary: z.string(),
        }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
