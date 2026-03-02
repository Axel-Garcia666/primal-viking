// Aplicación principal con routing y layout
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import ProfilePage from './pages/ProfilePage'
import Sidebar from './components/layout/Sidebar'
import { Toaster } from 'react-hot-toast'

// Guard de ruta privada: redirige a /auth si no hay sesión iniciada
function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? <AppLayout /> : <Navigate to="/auth" replace />
}

// Layout principal con sidebar responsivo
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Sidebar desktop (fijo) */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-colors">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (overlay) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden border-r bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

// Componente raíz con providers
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
          },
        }} />
      </AuthProvider>
    </ThemeProvider>
  )
}
