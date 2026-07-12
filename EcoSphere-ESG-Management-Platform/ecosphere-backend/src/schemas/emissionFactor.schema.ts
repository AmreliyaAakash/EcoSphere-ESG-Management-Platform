import { z } from 'zod';

export const createEmissionFactorSchema = z.object({
  body: z.object({
    activityType: z.string().optional(),
    unit: z.string().optional(),
    co2ePerUnit: z.number().optional(),
    source: z.string().optional(),
  }),
});

export const updateEmissionFactorSchema = z.object({
  body: z.object({
    activityType: z.string().optional(),
    unit: z.string().optional(),
    co2ePerUnit: z.number().optional(),
    source: z.string().optional(),
  }),
});
