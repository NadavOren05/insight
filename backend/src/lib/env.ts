import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  USE_REAL_DB: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3001),
}).superRefine((value, context) => {
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

  if (!value.SUPABASE_KEY) {
    context.addIssue({
      code: 'custom',
      path: ['SUPABASE_KEY'],
      message: 'SUPABASE_KEY is required when USE_REAL_DB=true',
    })
  }

  if (!value.CLAUDE_API_KEY) {
    context.addIssue({
      code: 'custom',
      path: ['CLAUDE_API_KEY'],
      message: 'CLAUDE_API_KEY is required when USE_REAL_DB=true',
    })
  }
})

export const env = envSchema.parse(process.env)
