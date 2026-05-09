import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('chat-app-theme') || 'light')
    const [effectiveTheme, setEffectiveTheme] = useState('light')

    useEffect(() => {
        const root = window.document.documentElement
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        root.classList.remove('dark')

        const activeTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme
        setEffectiveTheme(activeTheme)

        if (activeTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        localStorage.setItem('chat-app-theme', theme)
    }, [theme])

    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const root = window.document.documentElement
            const activeTheme = e.matches ? 'dark' : 'light'
            setEffectiveTheme(activeTheme)
            if (e.matches) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
