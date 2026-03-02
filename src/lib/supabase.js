// Cliente de Supabase - conecta la app con el backend en la nube
import { createClient } from '@supabase/supabase-js'

// Las credenciales se leen de las variables de entorno (archivo .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Faltan las credenciales de Supabase en el archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
