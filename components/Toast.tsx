'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
type Toast = { id: number; message: string; type: ToastType }

const ToastContext = createContext<{ show: (msg: string, type?: ToastType) => void }>({ show: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let nextId = 0

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const colors = { success: '#3fb950', error: '#f85149', info: '#C9A84C', warning: '#F7A600' }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ background: '#0d1117', border: `1px solid ${colors[toast.type]}44`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'slideIn 0.3s ease', fontFamily: 'monospace' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icons[toast.type]}</span>
            <span style={{ fontSize: 13, color: '#e6edf3', lineHeight: 1.5 }}>{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14, marginLeft: 'auto', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)