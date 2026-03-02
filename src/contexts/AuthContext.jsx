// Contexto de autenticación - gestiona el estado global del usuario
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Obtener la sesión actual al cargar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Suscribirse a cambios de autenticación (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Registrar usuario con email y contraseña
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        })

        // Crear perfil vacío si hay éxito
        if (!error && data?.user) {
            await supabase.from('profiles').insert([{ id: data.user.id }])
        }

        return { data, error }
    }

    // Iniciar sesión con email y contraseña
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    // Cerrar sesión
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const value = { user, loading, signUp, signIn, signOut }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}
