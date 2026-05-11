import { supabase } from '../lib/supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      ...options.headers
    }
  })
}