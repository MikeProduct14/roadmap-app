import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http') && supabaseAnonKey.startsWith('eyJ'))

// БАГ 1 FIX: клиент создаётся один раз, но isSupabaseConfigured() проверяет реальные значения
let _client = null
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) return null
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey)
  return _client
}

// Оставляем для обратной совместимости
export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null
