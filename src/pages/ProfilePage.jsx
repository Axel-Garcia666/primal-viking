import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Save, User, Mail, Calendar, Key, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function formatDate(dateString) {
    if (!dateString) return 'Desconocido'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

export default function ProfilePage() {
    const { user } = useAuth()
    const { profile, loading: profileLoading, uploadAvatar, updateProfile } = useProfile()
    const fileInputRef = useRef(null)

    // Form inputs
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Loading states
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    useEffect(() => {
        if (profile?.full_name) {
            setFullName(profile.full_name)
        }
    }, [profile])

    const handleAvatarClick = () => {
        if (!uploadingAvatar) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadingAvatar(true)
            await uploadAvatar(file)
            setUploadingAvatar(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        if (fullName.trim() === profile?.full_name) return

        setSavingProfile(true)
        await updateProfile({ full_name: fullName.trim() })
        setSavingProfile(false)
    }

    const handleSavePassword = async (e) => {
        e.preventDefault()
        if (!password || password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        setSavingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            toast.success('Contraseña actualizada correctamente')
            setPassword('')
            setConfirmPassword('')
        } catch (error) {
            console.error('Error al cambiar contraseña:', error)
            toast.error('No se pudo actualizar la contraseña')
        } finally {
            setSavingPassword(false)
        }
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
            {/* Cabecera del Perfil */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
            >
                {/* Fondo decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none" />

                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div
                        className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 cursor-pointer group"
                        onClick={handleAvatarClick}
                    >
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden relative">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800">
                                    <User size={60} />
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingAvatar ? (
                                    <Loader className="animate-spin text-white" size={24} />
                                ) : (
                                    <Camera className="text-white" size={32} />
                                )}
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="text-center">
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                            Hacer clic para cambiar
                        </span>
                    </div>
                </div>

                {/* Info Text */}
                <div className="flex-1 text-center md:text-left pt-2 relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile?.full_name || 'Mi Perfil'}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        Administra tu información personal y configuración.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                            <Mail size={16} className="text-indigo-500" />
                            <span className="text-sm font-medium">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                            <Calendar size={16} className="text-emerald-500" />
                            <span className="text-sm font-medium">Desde {formatDate(user.created_at)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Configuración Flex Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario Datos Personales */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSaveProfile}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                            <User size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Datos Personales</h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1 block">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-500 cursor-not-allowed focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                                El correo electrónico no se puede cambiar por seguridad.
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1 block">
                                Nombre para Mostrar
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="P. ej. John Doe"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-4 justify-end flex border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={savingProfile || profileLoading || fullName === profile?.full_name}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingProfile ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                            Guardar Cambios
                        </button>
                    </div>
                </motion.form>

                {/* Formulario Seguridad (Contraseña) */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSavePassword}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Key size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seguridad de la Cuenta</h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1 block">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1 block">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la nueva contraseña"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <div className="p-4 mt-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium flex gap-2 items-start">
                                <span className="text-lg leading-none mt-px">💡</span>
                                Usa una combinación de letras, números y símbolos para hacer tu contraseña más segura. No usamos tu contraseña anterior para verificar el cambio por comodidad temporal.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 mt-4 justify-end flex border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={savingPassword || !password || !confirmPassword}
                            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingPassword ? <Loader size={18} className="animate-spin text-current" /> : <Save size={18} />}
                            Actualizar Contraseña
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}
