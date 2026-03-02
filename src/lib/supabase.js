// Cliente de Supabase - conecta la app con el backend en la nube
import { createClient } from '@supabase/supabase-js'

// Las credenciales se leen de las variables de entorno (archivo .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Faltan las credenciales de Supabase en el archivo .env o en las variables de entorno de Vercel.')
}

// Solo crear el cliente si existen las credenciales para evitar crashes
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }) },
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Faltan credenciales' }) }) }) })
    } // Minimal fallback to prevent top-level crashes
