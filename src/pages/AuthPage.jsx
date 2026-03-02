// Página de autenticación - Login y Registro de usuarios
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, CheckSquare, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
    const { signIn, signUp, user } = useAuth()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Si ya hay sesión activa, redirigir al dashboard
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true })
    }, [user, navigate])
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({ email: '', password: '', fullName: '' })

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (isLogin) {
            // Iniciar sesión y redirigir al dashboard
            const { error } = await signIn(form.email, form.password)
            if (error) {
                setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message)
            } else {
                navigate('/dashboard', { replace: true })
            }
        } else {
            // Registrar usuario
            if (!form.fullName.trim()) { setError('El nombre es obligatorio'); setLoading(false); return }
            if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); setLoading(false); return }
            const { error } = await signUp(form.email, form.password, form.fullName)
            if (error) setError(error.message)
            else setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Fondo animado con gradientes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30"
                    >
                        <CheckSquare size={32} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona tus tareas en la nube</p>
                </div>

                {/* Card principal */}
                <div className="glass rounded-2xl p-8 shadow-2xl">
                    {/* Tabs Login / Registro */}
                    <div className="flex bg-gray-200/50 dark:bg-gray-900/50 rounded-xl p-1 mb-6">
                        {['Iniciar sesión', 'Registrarse'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => { setIsLogin(i === 0); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${(isLogin ? i === 0 : i === 1)
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {/* Nombre (solo en registro) */}
                            {!isLogin && (
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            {/* Correo */}
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-12 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Errores y mensajes de éxito */}
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
                                    {success}
                                </motion.div>
                            )}

                            {/* Botón principal */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader size={18} className="animate-spin" /> : null}
                                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>
                </div>

                <p className="text-center text-gray-500 dark:text-gray-600 text-xs mt-6">
                    Tus datos están protegidos y sincronizados en la nube 🔒
                </p>
            </motion.div>
        </div>
    )
}
