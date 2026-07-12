import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().url(),
  VITE_FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(10).default('default_jwt_secret_change_me_in_production'),
  CLERK_SECRET_KEY: z.string().default('sk_test_placeholder_key_until_user_updates_it'),
  NODE_ENV: z.string().default('development'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('Invalid environment variables:', envParse.error.format());
  process.exit(1);
}

export const env = envParse.data;
