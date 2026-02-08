import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

let _supabase: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a dummy client during build or when env vars are missing
    _supabase = createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    )
    return _supabase
  }

  _supabase = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return _supabase
}

export const supabase = getSupabase()
