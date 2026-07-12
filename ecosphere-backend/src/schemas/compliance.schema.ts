import { z } from 'zod';

export const createComplianceIssueSchema = z.object({
  body: z.object({
    auditId: z.string().min(1, 'auditId is required'),
    severity: z.string().min(1, 'severity is required'),
    description: z.string().min(1, 'description is required'),
    ownerId: z.string().optional(),
    owner: z.string().optional(),
    dueDate: z.string().min(1, 'dueDate is required'),
  }).refine(data => data.ownerId || data.owner, {
    message: 'owner or ownerId is required',
    path: ['ownerId']
  })
});
