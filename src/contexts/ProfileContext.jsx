import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const ProfileContext = createContext()

export function ProfileProvider({ children }) {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('avatar_url, full_name')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                // If the error is that full_name doesn't exist, we'll handle it gracefully
                if (error.message?.includes('full_name')) {
                    console.warn('Database column full_name missing. User needs to run SQL.')
                }
                throw error
            }

            if (data) {
                setProfile(data)
            } else {
                // Si no existe, crear un perfil vacío
                const { data: newData, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ id: user.id }])
                    .select()
                    .single()
                if (!insertError) setProfile(newData)
            }
        } catch (error) {
            console.error('Error cargando el perfil:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const uploadAvatar = async (file) => {
        if (!user) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            toast.loading('Subiendo imagen...', { id: 'uploadAvatar' })

            // 1. Subir al bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // 3. Actualizar tabla profiles
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Actualizar estado local sincronizado
            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
            toast.success('Foto de perfil actualizada', { id: 'uploadAvatar' })

        } catch (error) {
            console.error('Error subiendo avatar:', error)
            toast.error('Hubo un error al subir la foto', { id: 'uploadAvatar' })
        }
    }

    const updateProfile = async (updates) => {
        if (!user) return

        try {
            setLoading(true)
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            setProfile(prev => ({ ...prev, ...updates }))
            toast.success('Perfil actualizado correctamente')
            return { error: null }
        } catch (error) {
            console.error('Error actualizando perfil:', error)
            toast.error('Hubo un error al guardar los cambios')
            return { error }
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProfileContext.Provider value={{ profile, loading, uploadAvatar, updateProfile, refreshProfile: fetchProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext)
    if (!context) {
        throw new Error('useProfile debe usarse dentro de un ProfileProvider')
    }
    return context
}
