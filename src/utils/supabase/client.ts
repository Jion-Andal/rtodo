import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey)
  }
  return browserClient
}

export function isClientConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}
