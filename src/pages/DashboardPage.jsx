// Dashboard principal con estadísticas de tareas
import { motion } from 'framer-motion'
import { CheckCircle, Clock, BarChart3, Target, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../contexts/AuthContext'

const CATEGORY_COLORS = {
    trabajo: '#6366f1',
    personal: '#10b981',
    estudio: '#f59e0b',
    otro: '#8b5cf6',
}

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass rounded-2xl p-5 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
            <Icon size={22} className={color.replace('bg-', 'text-')} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">{label}</p>
            <p className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold truncate">{value}</p>
        </div>
    </motion.div>
)

export default function DashboardPage() {
    const { stats } = useTasks()
    const { user } = useAuth()
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'

    const chartData = stats.byCategory.map(cat => ({
        name: cat.name,
        Pendientes: cat.total - cat.completed,
        Completadas: cat.completed,
        color: CATEGORY_COLORS[cat.name.toLowerCase()] || '#6366f1',
    }))

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Encabezado */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ¡Hola, {userName}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Aquí tienes un resumen de tu productividad</p>
            </motion.div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Target} label="Total tareas" value={stats.total} color="bg-indigo-500" delay={0.1} />
                <StatCard icon={Clock} label="Pendientes" value={stats.pending} color="bg-amber-500" delay={0.15} />
                <StatCard icon={CheckCircle} label="Completadas" value={stats.completed} color="bg-emerald-500" delay={0.2} />
                <StatCard icon={TrendingUp} label="Progreso" value={`${stats.percentage}%`} color="bg-purple-500" delay={0.25} />
            </div>

            {/* Barra de progreso global */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                        <BarChart3 size={18} className="text-indigo-500 dark:text-indigo-400" />
                        Progreso general
                    </h2>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{stats.percentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percentage}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    {stats.completed} de {stats.total} tareas completadas
                </p>
            </motion.div>

            {/* Gráfica por categorías */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass rounded-2xl p-6"
            >
                <h2 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-indigo-500 dark:text-indigo-400" />
                    Tareas por categoría
                </h2>
                {stats.total === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay tareas todavía.</p>
                        <p className="text-sm mt-1">¡Crea tu primera tarea para ver estadísticas!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={20}>
                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="Pendientes" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Completadas" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* Resumen de categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                {stats.byCategory.map((cat, i) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="glass rounded-xl p-5 text-center"
                    >
                        <div
                            className="w-3 h-3 rounded-full mx-auto mb-3"
                            style={{ background: CATEGORY_COLORS[cat.name.toLowerCase()] }}
                        />
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{cat.name}</p>
                        <p className="text-gray-900 dark:text-white font-bold text-2xl my-1">{cat.total}</p>
                        <p className="text-gray-500 text-xs">{cat.completed} completadas</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
