import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  KeyIcon,
  ChevronDownIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { changePassword } from '../../api/auth'
import { getReporteOrdenes, getReporteInventario } from '../../api/reportes'
import { toast } from '../ui/Toast'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

// ── Modal cambiar contraseña ──────────────────────────────────────────────────
function ChangePasswordModal({ open, onClose }) {
  const [form, setForm]     = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await changePassword(form)
      toast.success('Contraseña actualizada correctamente')
      setForm({ current_password: '', password: '', password_confirmation: '' })
      onClose()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      if (err.response?.data?.message && !err.response?.data?.errors) {
        toast.error(err.response.data.message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Cambiar contraseña" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Contraseña actual *" type="password" value={form.current_password}
          onChange={set('current_password')} required error={errors.current_password?.[0]} />
        <Input label="Nueva contraseña *" type="password" value={form.password}
          onChange={set('password')} required error={errors.password?.[0]} />
        <Input label="Confirmar nueva contraseña *" type="password" value={form.password_confirmation}
          onChange={set('password_confirmation')} required />
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Panel de notificaciones ───────────────────────────────────────────────────
function NotifPanel({ onClose }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getReporteOrdenes(), getReporteInventario()])
      .then(([rOrd, rInv]) => {
        const items = []

        // Órdenes próximas a vencer (≤ 3 días) o vencidas
        ;(rOrd.data.proximas_entregas ?? []).forEach(o => {
          const dias = Number(o.dias_restantes ?? 0)
          if (dias < 0) {
            items.push({ tipo: 'orden-vencida', icon: 'ord', color: 'red',
              texto: `Orden ${o.codigo} vencida hace ${Math.abs(dias)} día(s)`,
              sub: o.cliente ?? '', link: `/ordenes/${o.id}` })
          } else if (dias <= 3) {
            items.push({ tipo: 'orden-pronto', icon: 'ord', color: 'amber',
              texto: `Orden ${o.codigo} vence en ${dias} día(s)`,
              sub: o.cliente ?? '', link: `/ordenes/${o.id}` })
          }
        })

        // Stock bajo mínimo
        ;(rInv.data.telas_bajo_minimo ?? []).forEach(t => {
          items.push({ tipo: 'stock-tela', icon: 'inv', color: 'orange',
            texto: `Tela "${t.nombre}" bajo mínimo`,
            sub: `Stock: ${t.stock_actual} ${t.unidad} (mín. ${t.stock_minimo})`, link: '/telas' })
        })
        ;(rInv.data.avios_bajo_minimo ?? []).forEach(a => {
          items.push({ tipo: 'stock-avio', icon: 'inv', color: 'orange',
            texto: `Avío "${a.nombre}" bajo mínimo`,
            sub: `Stock: ${a.stock_actual} ${a.unidad} (mín. ${a.stock_minimo})`, link: '/avios' })
        })

        setAlerts(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const iconColor = { red: 'text-red-500 bg-red-50', amber: 'text-amber-500 bg-amber-50', orange: 'text-orange-500 bg-orange-50' }

  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="font-semibold text-sm text-slate-800">Alertas</p>
        {!loading && <span className="text-xs text-slate-400">{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <p className="text-center py-6 text-sm text-slate-400">Cargando…</p>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Sin alertas activas</p>
            <p className="text-slate-300 text-xs mt-1">Todo en orden ✓</p>
          </div>
        ) : (
          alerts.map((a, i) => (
            <Link key={i} to={a.link} onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              <span className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${iconColor[a.color]}`}>
                {a.icon === 'ord'
                  ? <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                  : <CubeIcon className="w-3.5 h-3.5" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 leading-snug">{a.texto}</p>
                {a.sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{a.sub}</p>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

// ── Topbar ────────────────────────────────────────────────────────────────────
export default function Topbar({ title }) {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const [dropOpen,  setDropOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [pwModal, setPwModal]    = useState(false)
  const dropRef  = useRef(null)
  const notifRef = useRef(null)

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Contar alertas en segundo plano (solo roles admin/encargado)
  useEffect(() => {
    if (!user || user.role === 'empleado') return
    const fetchCount = () => {
      Promise.all([getReporteOrdenes(), getReporteInventario()])
        .then(([rOrd, rInv]) => {
          let n = 0
          ;(rOrd.data.proximas_entregas ?? []).forEach(o => { if (Number(o.dias_restantes ?? 1) <= 3) n++ })
          n += (rInv.data.total_alertas ?? 0)
          setNotifCount(n)
        })
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 5 * 60 * 1000) // refresca cada 5 min
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = async () => {
    setDropOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <h2 className="font-semibold text-slate-700 text-base">{title}</h2>

        <div className="flex items-center gap-2">
          {/* Notificaciones — solo admin/encargado */}
          {user?.role !== 'empleado' && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setDropOpen(false) }}
                className="relative p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                title="Alertas"
              >
                <BellIcon className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
            </div>
          )}

          {/* Perfil dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => { setDropOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
            >
              <UserCircleIcon className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{user?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user?.role}</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setDropOpen(false); setPwModal(true) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  <KeyIcon className="w-4 h-4" />
                  Cambiar contraseña
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal open={pwModal} onClose={() => setPwModal(false)} />
    </>
  )
}
