import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

export const supabase = createClient(env.SUPABASE_URL ?? 'http://localhost', env.SUPABASE_KEY ?? 'mock-key', {
  auth: {
    persistSession: false,
  },
})
