'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

const ThemeContext = createContext<{
  theme: 'dark' | 'light'
  toggle: () => void
}>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('cmp_theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('cmp_theme', theme)
    const root = document.documentElement

    if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#f0f2f5')
      root.style.setProperty('--bg-secondary', '#ffffff')
      root.style.setProperty('--bg-tertiary', '#e8eaed')
      root.style.setProperty('--border', '#d1d5db')
      root.style.setProperty('--text-primary', '#111827')
      root.style.setProperty('--text-secondary', '#4b5563')
      root.style.setProperty('--text-muted', '#9ca3af')
      document.body.style.background = '#f0f2f5'
      document.body.style.color = '#111827'
    } else {
      root.style.setProperty('--bg-primary', '#060a0f')
      root.style.setProperty('--bg-secondary', '#0d1117')
      root.style.setProperty('--bg-tertiary', '#161b22')
      root.style.setProperty('--border', '#21262d')
      root.style.setProperty('--text-primary', '#e6edf3')
      root.style.setProperty('--text-secondary', '#8b949e')
      root.style.setProperty('--text-muted', '#484f58')
      document.body.style.background = '#060a0f'
      document.body.style.color = '#e6edf3'
    }
  }, [theme])

  const toggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export function ThemeToggleButton() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid #21262d',
        background: theme === 'dark' ? '#161b22' : '#fff',
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}