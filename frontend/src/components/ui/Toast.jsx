/**
 * Sistema de toasts global.
 *
 * Uso:
 *   import { toast } from '../components/ui/Toast'
 *   toast.success('Guardado')
 *   toast.error('Error al guardar')
 *   toast.info('Cargando...')
 *
 * Montar <ToastContainer /> una vez en AppLayout.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

// ── Store minimalista (sin Zustand) ──────────────────────────────────────────
let listeners = []
let toastId   = 0

function emit(toast) {
  listeners.forEach(fn => fn(toast))
}

export const toast = {
  success: (msg, duration = 3500) => emit({ id: ++toastId, type: 'success', msg, duration }),
  error:   (msg, duration = 5000) => emit({ id: ++toastId, type: 'error',   msg, duration }),
  info:    (msg, duration = 3000) => emit({ id: ++toastId, type: 'info',    msg, duration }),
}

// ── Ítem visual ───────────────────────────────────────────────────────────────
const STYLES = {
  success: { bg: 'bg-emerald-50 border-emerald-300', icon: CheckCircleIcon,      ic: 'text-emerald-600', text: 'text-emerald-900' },
  error:   { bg: 'bg-red-50 border-red-300',         icon: XCircleIcon,          ic: 'text-red-600',     text: 'text-red-900'     },
  info:    { bg: 'bg-blue-50 border-blue-200',        icon: InformationCircleIcon,ic: 'text-blue-600',    text: 'text-blue-900'    },
}

function ToastItem({ toast: t, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Entrada
    const enterTimer = setTimeout(() => setVisible(true), 10)
    // Salida suave
    const exitTimer  = setTimeout(() => setVisible(false), t.duration - 300)
    // Eliminar
    const removeTimer = setTimeout(() => onRemove(t.id), t.duration)
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer); clearTimeout(removeTimer) }
  }, [t, onRemove])

  const s = STYLES[t.type] ?? STYLES.info
  const Icon = s.icon

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full
        transition-all duration-300
        ${s.bg}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.ic}`} />
      <p className={`flex-1 text-sm font-medium ${s.text}`}>{t.msg}</p>
      <button
        onClick={() => onRemove(t.id)}
        className="text-slate-400 hover:text-slate-600 shrink-0"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Contenedor (montar una vez en AppLayout) ──────────────────────────────────
export function ToastContainer() {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (t) => setItems(prev => [...prev, t])
    listeners.push(handler)
    return () => { listeners = listeners.filter(fn => fn !== handler) }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {items.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
