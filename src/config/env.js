import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4003),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/taskflow'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters').refine((secret) => !/replace_with|change_me|your_secret/i.test(secret), 'JWT_SECRET must be replaced with a unique random secret'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

export function loadConfig(source = process.env) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return parsed.data;
}
