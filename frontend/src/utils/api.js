import { supabase } from '../lib/supabase'

const BASE_URL =  'http://localhost:3000' || import.meta.env.VITE_API_URL 

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