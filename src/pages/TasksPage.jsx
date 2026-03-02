// Página principal de tareas: lista, filtros y gestión
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Loader } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useTasks } from '../hooks/useTasks'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'trabajo', label: '💼 Trabajo' },
    { value: 'personal', label: '🏠 Personal' },
    { value: 'estudio', label: '📚 Estudio' },
    { value: 'otro', label: '🔮 Otro' },
]

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'completed', label: 'Completadas' },
]

export default function TasksPage() {
    const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks()
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)

    // Filtrar tareas según búsqueda, estado y categoría
    const filteredTasks = tasks.filter(task => {
        const matchSearch = !search ||
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase())
        // Como ahora es Kanban, filtramos visualmente si el usuario elige un status específico, 
        // pero por defecto mostramos todos en las columnas.
        const matchStatus = filterStatus === 'all' || task.status === filterStatus
        const matchCategory = filterCategory === 'all' || task.category === filterCategory
        return matchSearch && matchStatus && matchCategory
    })

    const columns = {
        pending: { id: 'pending', title: '⏳ Pendientes', color: 'text-amber-500' },
        in_progress: { id: 'in_progress', title: '🔄 En Progreso', color: 'text-blue-500' },
        completed: { id: 'completed', title: '✅ Completadas', color: 'text-emerald-500' }
    }

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId) return

        // Mover entre columnas
        const taskId = draggableId
        const newStatus = destination.droppableId

        // Optimistic update UI check via function, saving to server
        await updateTask(taskId, {
            status: newStatus,
            completed: newStatus === 'completed'
        })
    }

    const handleAdd = () => { setEditingTask(null); setShowModal(true) }
    const handleEdit = (task) => { setEditingTask(task); setShowModal(true) }
    const handleClose = () => { setShowModal(false); setEditingTask(null) }

    const handleSave = async (taskData) => {
        if (editingTask) {
            await updateTask(editingTask.id, taskData)
        } else {
            await addTask(taskData)
        }
        handleClose()
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
            {/* Encabezado con botón de agregar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} encontradas
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
                >
                    <Plus size={18} />
                    Nueva Tarea
                </motion.button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl pl-14 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-base"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                    >
                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                    >
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Lista de tareas */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader size={32} className="animate-spin text-indigo-400" />
                </div>
            ) : filteredTasks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    {tasks.length === 0 ? (
                        <>
                            <div className="text-5xl mb-4">✨</div>
                            <p className="text-gray-900 dark:text-white text-lg font-medium">¡No tienes tareas todavía!</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Crea tu primera tarea con el botón de arriba</p>
                        </>
                    ) : (
                        <>
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-gray-900 dark:text-white text-lg font-medium">No se encontraron tareas</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Intenta cambiar los filtros o la búsqueda</p>
                        </>
                    )}
                </motion.div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-10">
                        {Object.values(columns).map(column => {
                            const columnTasks = filteredTasks.filter(t => t.status === column.id)
                            return (
                                <div key={column.id} className="flex flex-col bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl p-4 min-h-[500px]">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                                        <span className="bg-white dark:bg-gray-700 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">{columnTasks.length}</span>
                                    </div>
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 transition-colors pl-1 pr-2 pt-1 pb-4 flex flex-col gap-3 rounded-xl ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-300 dark:border-indigo-700' : 'border-2 border-transparent'
                                                    }`}
                                            >
                                                {columnTasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={snapshot.isDragging ? 'rotate-2 scale-105 opacity-90 transition-transform' : ''}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                <TaskCard
                                                                    task={task}
                                                                    onEdit={handleEdit}
                                                                    onDelete={deleteTask}
                                                                    onToggle={toggleTask}
                                                                    onUpdateTask={updateTask}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )
                        })}
                    </div>
                </DragDropContext>
            )}

            {/* Modal de creación/edición */}
            <AnimatePresence>
                {showModal && (
                    <TaskModal task={editingTask} onSave={handleSave} onClose={handleClose} />
                )}
            </AnimatePresence>
        </div>
    )
}
