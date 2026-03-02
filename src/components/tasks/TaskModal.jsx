// Modal de creación y edición de tareas
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader, Trash2 } from 'lucide-react'

const CATEGORIES = [
    { value: 'trabajo', label: '💼 Trabajo' },
    { value: 'personal', label: '🏠 Personal' },
    { value: 'estudio', label: '📚 Estudio' },
    { value: 'otro', label: '🔮 Otro' },
]

const PRIORITIES = [
    { value: 'low', label: '⚪ Baja' },
    { value: 'medium', label: '🟡 Media' },
    { value: 'high', label: '🔴 Alta' },
]

export default function TaskModal({ task, onSave, onClose }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        due_date: '',
        status: 'pending',
        subtasks: [],
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Prellenar datos si se está editando
    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description: task.description || '',
                category: task.category || 'personal',
                priority: task.priority || 'medium',
                status: task.status || 'pending',
                subtasks: task.subtasks || [],
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
            })
        }
    }, [task])

    const handleAddSubtask = () => {
        setForm(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: '', completed: false }]
        }))
    }

    const handleChangeSubtask = (id, newTitle) => {
        setForm(prev => ({
            ...prev,
            subtasks: prev.subtasks.map(st => st.id === id ? { ...st, title: newTitle } : st)
        }))
    }

    const handleDeleteSubtask = (id) => {
        setForm(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(st => st.id !== id)
        }))
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) { setError('El título es obligatorio'); return }
        setLoading(true)
        const taskData = {
            ...form,
            due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        }
        await onSave(taskData)
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="relative z-10 w-full max-w-md glass rounded-2xl p-6 shadow-2xl"
            >
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-gray-900 dark:text-white font-bold text-lg">
                        {task ? '✏️ Editar Tarea' : '✨ Nueva Tarea'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Título */}
                    <div>
                        <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Título *</label>
                        <input
                            name="title"
                            type="text"
                            placeholder="¿Qué necesitas hacer?"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Descripción (opcional)</label>
                        <textarea
                            name="description"
                            placeholder="Detalles adicionales..."
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Categoría */}
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Categoría</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Prioridad */}
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Prioridad</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                            >
                                {PRIORITIES.map(prio => (
                                    <option key={prio.value} value={prio.value}>{prio.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha de vencimiento */}
                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Vencimiento</label>
                            <input
                                name="due_date"
                                type="date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Subtareas */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">Sub-tareas (Checklist)</label>
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md transition-colors"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 stylish-scrollbar">
                            <AnimatePresence>
                                {form.subtasks.map((st, index) => (
                                    <motion.div
                                        key={st.id}
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-4 h-4 rounded-sm border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder={`Sub-tarea ${index + 1}`}
                                            value={st.title}
                                            onChange={(e) => handleChangeSubtask(st.id, e.target.value)}
                                            className="flex-1 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 px-1 py-1 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                                            autoFocus={st.title === ''}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSubtask(st.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {form.subtasks.length === 0 && (
                                <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2 italic bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">No hay subtareas. ¡Agrega una para desglosar tu trabajo!</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:border-gray-500 transition-all text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader size={15} className="animate-spin" />}
                            {task ? 'Guardar' : 'Crear Tarea'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
