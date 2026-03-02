import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        fetchProfile()
    }, [user])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('avatar_url, full_name')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            if (data) {
                setProfile(data)
            } else {
                // Si no existe, crear un perfil vacío
                await supabase.from('profiles').insert([{ id: user.id }])
            }
        } catch (error) {
            console.error('Error cargando el perfil:', error)
        } finally {
            setLoading(false)
        }
    }

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

            // Actualizar estado local
            setProfile({ avatar_url: publicUrl })
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

    return { profile, loading, uploadAvatar, updateProfile }
}
