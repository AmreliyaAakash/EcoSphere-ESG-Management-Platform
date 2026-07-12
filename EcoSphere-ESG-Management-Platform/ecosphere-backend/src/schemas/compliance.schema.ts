import { z } from 'zod';

export const createComplianceIssueSchema = z.object({
  body: z.object({
    auditId: z.string().optional(),
    severity: z.string().optional(),
    description: z.string().optional(),
    ownerId: z.string().optional(),
    owner: z.string().optional(),
    dueDate: z.string().optional(),
  })
});
