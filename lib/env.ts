import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET должен быть минимум 16 символов'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL должен быть валидным URL'),
  RESEND_API_KEY: z.string().optional(),
  DEV_USER_LOGIN: z.string().optional(),
  DEV_USER_PASSWORD: z.string().optional(),
  DEV_USER_NAME: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    const msg = `\n❌ Invalid environment variables:\n${issues}\n`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
  return result.data ?? (process.env as unknown as z.infer<typeof envSchema>);
}

export const env = validateEnv();
