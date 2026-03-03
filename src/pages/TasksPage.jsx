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
    const [activeTab, setActiveTab] = useState('pending')

    // Filtrar tareas según búsqueda, estado y categoría
    const filteredTasks = tasks.filter(task => {
        const matchSearch = !search ||
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || task.status === filterStatus
        const matchCategory = filterCategory === 'all' || task.category === filterCategory
        return matchSearch && matchStatus && matchCategory
    })

    const columns = {
        pending: { id: 'pending', title: '⏳ Pendientes', color: 'text-amber-500', bg: 'bg-amber-500' },
        in_progress: { id: 'in_progress', title: '🔄 En Progreso', color: 'text-blue-500', bg: 'bg-blue-500' },
        completed: { id: 'completed', title: '✅ Completadas', color: 'text-emerald-500', bg: 'bg-emerald-500' }
    }

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId) return

        const taskId = draggableId
        const newStatus = destination.droppableId

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
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
            {/* Encabezado con botón de agregar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Tareas</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} encontradas
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                >
                    <Plus size={20} />
                    Nueva Tarea
                </motion.button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="flex-1 md:flex-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                    >
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Navegación por Tabs (Móvil) - Siempre visible */}
            <div className="md:hidden flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                {Object.values(columns).map((col) => (
                    <button
                        key={col.id}
                        onClick={() => setActiveTab(col.id)}
                        className={`relative flex-1 py-2.5 text-xs font-bold transition-all duration-200 rounded-lg ${activeTab === col.id ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        {activeTab === col.id && (
                            <motion.div
                                layoutId="activeTab"
                                className={`absolute inset-0 rounded-lg shadow-sm ${col.bg}`}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{col.title.split(' ')[1]}</span>
                    </button>
                ))}
            </div>

            {/* Lista de tareas */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader size={32} className="animate-spin text-indigo-400" />
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-4xl mb-4 opacity-50">✨</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                        No hay tareas {activeTab === 'pending' ? 'pendientes' : activeTab === 'in_progress' ? 'en progreso' : 'completadas'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                        + Crear una tarea ahora
                    </button>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {Object.values(columns).map(column => {
                            const columnTasks = filteredTasks.filter(t => t.status === column.id)
                            // En móvil solo mostrar el tab activo
                            const isVisible = activeTab === column.id

                            return (
                                <div
                                    key={column.id}
                                    className={`${isVisible ? 'flex' : 'hidden md:flex'} flex-col bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 min-h-[500px] border border-gray-100 dark:border-gray-800/50`}
                                >
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${column.bg}`} />
                                            <h3 className={`font-bold text-sm uppercase tracking-wider ${column.color}`}>{column.title}</h3>
                                        </div>
                                        <span className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">{columnTasks.length}</span>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 transition-all duration-200 mt-2 flex flex-col gap-4 rounded-xl ${snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
                                                    }`}
                                            >
                                                <AnimatePresence mode="popLayout">
                                                    {columnTasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`${snapshot.isDragging ? 'z-50' : ''}`}
                                                                >
                                                                    <motion.div
                                                                        layout
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <TaskCard
                                                                            task={task}
                                                                            onEdit={handleEdit}
                                                                            onDelete={deleteTask}
                                                                            onToggle={toggleTask}
                                                                            onUpdateTask={updateTask}
                                                                        />
                                                                    </motion.div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                </AnimatePresence>
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

