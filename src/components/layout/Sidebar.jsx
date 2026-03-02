// Barra lateral de navegación principal
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, CheckSquare, LogOut, Sun, Moon, CheckSquare as Logo, User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useProfile } from '../../hooks/useProfile'
import { useRef } from 'react'

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Mis Tareas' },
    { to: '/profile', icon: User, label: 'Configuración' },
]

export default function Sidebar({ onClose }) {
    const { user, signOut } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const { profile, loading: profileLoading, uploadAvatar } = useProfile()
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
    const userInitial = userName.charAt(0).toUpperCase()

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Logo size={18} className="text-white" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-lg">TaskFlow</span>
            </div>

            {/* Avatar y usuario */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-white/10">
                <div
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors group relative"
                    onClick={() => fileInputRef.current?.click()}
                    title="Cambiar foto de perfil"
                >
                    {profile?.avatar_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors">
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs text-center font-medium leading-tight">Subir<br />Foto</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:shadow-lg transition-all overflow-hidden">
                            <span>{userInitial}</span>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs text-center font-medium leading-tight">Subir<br />Foto</span>
                            </div>
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{userName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user?.email}</p>
                    </div>
                    {/* Input oculto para la imagen */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) uploadAvatar(file)
                        }}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                    />
                </div>
                {/* Indicador de sincronización en tiempo real */}
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado en tiempo real
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive
                                ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/50 dark:to-purple-600/30 text-indigo-700 dark:text-white border border-indigo-200 dark:border-indigo-500/30'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer: toggle tema y logout */}
            <div className="px-3 pb-4 space-y-1 border-t border-gray-200 dark:border-white/10 pt-3">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all text-sm font-medium"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    {isDark ? 'Modo claro' : 'Modo oscuro'}
                </button>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </div>
    )
}
