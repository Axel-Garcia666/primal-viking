// Contexto de tema - gestiona el modo oscuro/claro
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        // Cargar preferencia guardada o usar oscuro como default
        const saved = localStorage.getItem('taskflow-theme')
        return saved ? saved === 'dark' : true
    })

    useEffect(() => {
        // Aplicar la clase al elemento raíz y guardar en localStorage
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('taskflow-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
