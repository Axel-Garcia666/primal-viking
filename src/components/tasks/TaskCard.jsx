// Tarjeta de tarea individual con acciones de editar, eliminar y toggle
import { motion } from 'framer-motion'
import { Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react'

const CATEGORY_STYLES = {
    trabajo: { label: '💼 Trabajo', bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
    personal: { label: '🏠 Personal', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
    estudio: { label: '📚 Estudio', bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
    otro: { label: '🔮 Otro', bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
}

const PRIORITY_STYLES = {
    low: { color: 'bg-gray-400', label: 'Baja' },
    medium: { color: 'bg-amber-500', label: 'Media' },
    high: { color: 'bg-red-500', label: 'Alta' }
}

function formatDate(dateString) {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(dateString, completed) {
    if (!dateString || completed) return false
    return new Date(dateString) < new Date()
}

export default function TaskCard({ task, onEdit, onDelete, onToggle, onUpdateTask }) {
    const cat = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.otro
    const overdue = isOverdue(task.due_date, task.completed)
    const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium

    const subtasks = task.subtasks || []
    const completedSubtasks = subtasks.filter(st => st.completed).length
    const progressPercentage = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

    const handleToggle = async () => {
        await onToggle(task.id, !task.completed)
    }

    const handleSubtaskToggle = async (e, subtaskId) => {
        // Prevent toggle from dragging or opening modal
        if (e && e.stopPropagation) e.stopPropagation()
        if (!onUpdateTask) return

        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        await onUpdateTask(task.id, { subtasks: updatedSubtasks })
    }

    const handleDelete = async () => {
        if (window.confirm('¿Eliminar esta tarea?')) {
            await onDelete(task.id)
        }
    }

    return (
        <div
            className={`bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border flex flex-col gap-3 group relative overflow-hidden transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''
                } ${overdue ? 'border-red-500/30' : 'border-gray-200 dark:border-gray-800'}`}
        >
            {/* Indicador de Prioridad (Borde izquierdo) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority.color}`} />

            {/* Cabecera y Acciones */}
            <div className="flex items-start justify-between pl-2">
                <p className={`font-semibold text-sm sm:text-base leading-snug flex-1 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                    }`}>
                    {task.title}
                </p>
                {/* Acciones (estáticas en mobile, hover en desktop) */}
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            {/* Contenido */}
            <div className="flex flex-col gap-2 pl-2">
                {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Badge de categoría */}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${cat.bg} ${cat.text} ${cat.border}`}>
                        {cat.label}
                    </span>
                    {/* Fecha de vencimiento */}
                    {task.due_date && (
                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${overdue ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                            {overdue ? <AlertCircle size={10} /> : <Calendar size={10} />}
                            {formatDate(task.due_date)}
                        </span>
                    )}
                </div>

                {/* Subtareas Progress */}
                {subtasks.length > 0 && (
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
                            <span>Progreso Checklist</span>
                            <span>{completedSubtasks}/{subtasks.length} ({progressPercentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Mini Checklist */}
                        <div className="flex flex-col gap-1 mt-2">
                            {subtasks.map((st) => (
                                <label
                                    key={st.id}
                                    className="flex items-start gap-2 text-xs group/st cursor-pointer"
                                    onClick={(e) => e.stopPropagation()} // Stop drag for label click
                                >
                                    <input
                                        type="checkbox"
                                        checked={st.completed}
                                        onChange={(e) => handleSubtaskToggle(e, st.id)}
                                        className="mt-0.5 custom-checkbox w-3.5 h-3.5 rounded-sm flex-shrink-0"
                                    />
                                    <span className={`transition-colors line-clamp-2 ${st.completed ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-300 group-hover/st:text-indigo-500'}`}>
                                        {st.title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
