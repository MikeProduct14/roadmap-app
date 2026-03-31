import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = () => {
  const isValid = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.startsWith('eyJ')
  )
  
  if (!isValid) {
    console.error('Supabase не настроен. Проверьте переменные окружения:', {
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseAnonKey),
      urlValid: supabaseUrl.startsWith('http'),
      keyValid: supabaseAnonKey.startsWith('eyJ')
    })
  }
  
  return isValid
}

// Создаём клиент только если конфигурация валидна
let _client = null
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn('Попытка получить Supabase клиент без валидной конфигурации')
    return null
  }
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
  return _client
}

// Экспортируем клиент (может быть null)
export const supabase = getSupabaseClient()
