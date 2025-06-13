import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, ThemeContextType } from '../types'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = storedTheme || systemTheme
    setThemeState(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
