import { z } from 'zod';

export const createEmissionFactorSchema = z.object({
  body: z.object({
    activityType: z.string().min(1, 'Activity type is required'),
    unit: z.string().min(1, 'Unit is required'),
    co2ePerUnit: z.number().positive('co2ePerUnit must be positive'),
    source: z.string().min(1, 'Source is required'),
  }),
});

export const updateEmissionFactorSchema = z.object({
  body: z.object({
    activityType: z.string().min(1).optional(),
    unit: z.string().min(1).optional(),
    co2ePerUnit: z.number().positive('co2ePerUnit must be positive').optional(),
    source: z.string().min(1).optional(),
  }),
});
