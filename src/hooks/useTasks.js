// Hook personalizado para gestión de tareas con sincronización en tiempo real
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useTasks() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Cargar todas las tareas del usuario actual
    const fetchTasks = useCallback(async () => {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTasks(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    // Agregar una nueva tarea
    const addTask = async (taskData) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{ ...taskData, user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            toast.success('Tarea creada correctamente')
            return { data, error: null }
        } catch (err) {
            toast.error('Error al crear tarea: ' + err.message)
            return { data: null, error: err.message }
        }
    }

    // Editar una tarea existente
    const updateTask = async (taskId, updates) => {
        try {
            // Actualización optimista local
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))

            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (err) {
            toast.error('Error al actualizar tarea: ' + err.message)
            // Revertir en caso de error recargando
            fetchTasks()
            return { data: null, error: err.message }
        }
    }

    // Eliminar una tarea
    const deleteTask = async (taskId) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
                .eq('user_id', user.id)

            if (error) throw error
            toast.success('Tarea eliminada')
            return { error: null }
        } catch (err) {
            toast.error('Error al eliminar: ' + err.message)
            return { error: err.message }
        }
    }

    // Cambiar estado completado/pendiente de una tarea (Mantenido para compatibilidad temporal o botones rápidos)
    const toggleTask = async (taskId, currentCompleted) => {
        const newStatus = currentCompleted ? 'pending' : 'completed'
        return updateTask(taskId, { completed: !currentCompleted, status: newStatus })
    }

    useEffect(() => {
        if (!user) {
            setTasks([])
            setLoading(false)
            return
        }

        fetchTasks()

        // Suscripción Realtime: escucha cambios en la BD y actualiza la UI automáticamente
        const channel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTasks(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
                    } else if (payload.eventType === 'DELETE') {
                        setTasks(prev => prev.filter(t => t.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, fetchTasks])

    // Estadísticas calculadas para el dashboard
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        percentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
        byCategory: ['trabajo', 'personal', 'estudio', 'otro'].map(cat => ({
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            total: tasks.filter(t => t.category === cat).length,
            completed: tasks.filter(t => t.category === cat && t.status === 'completed').length,
        })),
    }

    return { tasks, loading, error, stats, addTask, updateTask, deleteTask, toggleTask, fetchTasks }
}
