import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('chat-app-theme') || 'light')
    const [effectiveTheme, setEffectiveTheme] = useState('light')
    const location = useLocation()

    useEffect(() => {
        const root = window.document.documentElement
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

        const activeTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme
        setEffectiveTheme(activeTheme)

        // Nếu là trang đăng nhập hoặc đăng ký thì luôn để chế độ sáng
        if (activeTheme === 'dark' && !isAuthPage) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        localStorage.setItem('chat-app-theme', theme)
    }, [theme, location.pathname])

    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const root = window.document.documentElement
            const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
            const activeTheme = e.matches ? 'dark' : 'light'
            setEffectiveTheme(activeTheme)
            
            // Nếu là trang đăng nhập hoặc đăng ký thì luôn để chế độ sáng
            if (activeTheme === 'dark' && !isAuthPage) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme, location.pathname])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
