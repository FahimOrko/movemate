import { z } from 'zod';

// An empty value in .env counts as unset.
const optionalString = z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
  OPENROUTER_API_KEY: optionalString,
  OPENROUTER_VISION_MODEL: optionalString,
  OPENROUTER_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  ENABLE_RESET: z.preprocess((value) => (value === '' ? undefined : value), z.enum(['true', 'false']).default('false').transform((value) => value === 'true')),
  IF_INSURANCE_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
});

type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env = parseEnv(process.env);
