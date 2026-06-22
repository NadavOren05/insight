import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  USE_REAL_DB: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  ALLOW_MOCK_FALLBACK: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3001),
}).superRefine((value, context) => {
  if (!value.USE_REAL_DB && !value.ALLOW_MOCK_FALLBACK) {
    context.addIssue({
      code: 'custom',
      path: ['USE_REAL_DB'],
      message: 'USE_REAL_DB must be true when ALLOW_MOCK_FALLBACK=false',
    })
  }

  if (!value.USE_REAL_DB) {
    return
  }

  if (!value.SUPABASE_URL || !z.string().url().safeParse(value.SUPABASE_URL).success) {
    context.addIssue({
      code: 'custom',
      path: ['SUPABASE_URL'],
      message: 'SUPABASE_URL is required and must be a valid URL when USE_REAL_DB=true',
    })
  }

  const supabaseKey = value.SUPABASE_KEY ?? value.SUPABASE_SECRET_KEY ?? value.SUPABASE_PUBLISHABLE_KEY

  if (!supabaseKey) {
    context.addIssue({
      code: 'custom',
      path: ['SUPABASE_KEY'],
      message:
        'SUPABASE_KEY, SUPABASE_SECRET_KEY, or SUPABASE_PUBLISHABLE_KEY is required when USE_REAL_DB=true',
    })
  }
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  ...parsedEnv,
  SUPABASE_KEY:
    parsedEnv.SUPABASE_KEY ?? parsedEnv.SUPABASE_SECRET_KEY ?? parsedEnv.SUPABASE_PUBLISHABLE_KEY,
}
