import { z } from 'zod';

export const registerSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
}).strict() });
export const loginSchema = z.object({ body: z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128)
}).strict() });
export const updateMeSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()).optional(),
  password: z.string().min(8).max(128).optional()
}).strict().refine((body) => Object.keys(body).length > 0, 'At least one field is required') });
