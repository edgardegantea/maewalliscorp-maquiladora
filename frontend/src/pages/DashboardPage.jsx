import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import {
  ClipboardDocumentListIcon, UserGroupIcon, BuildingOffice2Icon,
  DocumentTextIcon, ExclamationTriangleIcon, BanknotesIcon,
  CalendarDaysIcon, ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../components/ui/StatCard'
import Badge   from '../components/ui/Badge'
import { getOrdenes }   from '../api/ordenes'
import { getEmpleados } from '../api/empleados'
import { getClientes }  from '../api/catalogos'
import { getHojas }     from '../api/produccion'
import { getReporteInventario, getReporteOrdenes } from '../api/reportes'
import { getGestionPermisos, getGestionAclaraciones } from '../api/portal'
import { getPortalProduccion, getPortalPagos, getPortalAsistencia } from '../api/portal'

// ── Dashboard Admin / Encargado ───────────────────────────────────────────────
function DashboardAdmin() {
  const [stats,       setStats]       = useState({ ordenes: 0, empleados: 0, clientes: 0, hojas: 0 })
  const [alertas,     setAlertas]     = useState({ telas: [], avios: [] })
  const [recientes,   setRecientes]   = useState([])
  const [proximas,    setProximas]    = useState([])
  const [pendPermisos,setPendPermisos]= useState(0)
  const [pendAclar,   setPendAclar]   = useState(0)

  useEffect(() => {
    Promise.all([
      getOrdenes({ per_page: 1, status: 'en_proceso' }),
      getEmpleados({ per_page: 1, status: 'activo' }),
      getClientes({ per_page: 1 }),
      getHojas({ per_page: 1 }),
      getReporteInventario(),
      getReporteOrdenes(),
      getGestionPermisos({ status: 'pendiente', per_page: 1 }),
      getGestionAclaraciones({ status: 'pendiente', per_page: 1 }),
      getOrdenes({ per_page: 5, status: 'en_proceso' }),
    ]).then(([ord, emp, cli, hoj, inv, repOrd, perm, aclar, recOrd]) => {
      setStats({ ordenes: ord.data.total, empleados: emp.data.total, clientes: cli.data.total, hojas: hoj.data.total })
      setAlertas({ telas: inv.data.telas_bajo_minimo ?? [], avios: inv.data.avios_bajo_minimo ?? [] })
      setProximas(repOrd.data.proximas_entregas?.slice(0, 5) ?? [])
      setPendPermisos(perm.data.total ?? 0)
      setPendAclar(aclar.data.total ?? 0)
      setRecientes(recOrd.data.data)
    }).catch(() => {})
  }, [])

  const totalAlertas = (alertas.telas.length) + (alertas.avios.length)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Órdenes activas"     value={stats.ordenes}   icon={ClipboardDocumentListIcon} color="blue"   />
        <StatCard label="Empleados activos"   value={stats.empleados} icon={UserGroupIcon}             color="green"  />
        <StatCard label="Clientes"            value={stats.clientes}  icon={BuildingOffice2Icon}       color="purple" />
        <StatCard label="Hojas de producción" value={stats.hojas}     icon={DocumentTextIcon}          color="yellow" />
      </div>

      {/* Alertas rápidas */}
      {(pendPermisos > 0 || pendAclar > 0 || totalAlertas > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pendPermisos > 0 && (
            <Link to="/gestion/permisos"
              className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100 transition-colors">
              <CalendarDaysIcon className="w-6 h-6 text-yellow-600 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">{pendPermisos} permiso{pendPermisos !== 1 ? 's' : ''} pendiente{pendPermisos !== 1 ? 's' : ''}</p>
                <p className="text-xs text-yellow-700">Requieren respuesta</p>
              </div>
            </Link>
          )}
          {pendAclar > 0 && (
            <Link to="/gestion/aclaraciones"
              className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4 hover:bg-violet-100 transition-colors">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-violet-600 shrink-0" />
              <div>
                <p className="font-semibold text-violet-900">{pendAclar} aclaración{pendAclar !== 1 ? 'es' : ''} pendiente{pendAclar !== 1 ? 's' : ''}</p>
                <p className="text-xs text-violet-700">Sin respuesta</p>
              </div>
            </Link>
          )}
          {totalAlertas > 0 && (
            <Link to="/movimientos-almacen"
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-red-900">{totalAlertas} artículo{totalAlertas !== 1 ? 's' : ''} bajo mínimo</p>
                <p className="text-xs text-red-700">Inventario crítico</p>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes en proceso */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Órdenes en proceso</h3>
            <Link to="/ordenes" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          {recientes.length === 0
            ? <p className="text-slate-400 text-sm">No hay órdenes en proceso</p>
            : <div className="space-y-2">
                {recientes.map(o => (
                  <Link key={o.id} to={`/ordenes/${o.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{o.codigo} — {o.modelo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.cliente?.nombre} · Entrega: {o.fecha_entrega ?? 'Sin fecha'}</p>
                    </div>
                    <Badge value={o.prioridad} />
                  </Link>
                ))}
              </div>
          }
        </div>

        {/* Próximas entregas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Próximas entregas</h3>
            <Link to="/ordenes" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          {proximas.length === 0
            ? <p className="text-slate-400 text-sm">Sin entregas próximas registradas</p>
            : <div className="space-y-2">
                {proximas.map(o => {
                  const dias = Math.round(o.dias_restantes)
                  const col = dias < 0 ? 'text-red-600 font-bold' : dias <= 3 ? 'text-orange-500 font-semibold' : 'text-slate-500'
                  return (
                    <Link key={o.id} to={`/ordenes/${o.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{o.codigo} — {o.modelo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{o.cliente}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs ${col}`}>
                          {dias < 0 ? `${Math.abs(dias)}d vencida` : dias === 0 ? 'Hoy' : `en ${dias}d`}
                        </p>
                        <p className="text-xs text-slate-400">{o.fecha_entrega}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
          }
        </div>
      </div>

      {/* Stock bajo mínimo */}
      {totalAlertas > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-800">Stock bajo mínimo</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ...alertas.telas.map(t => ({ ...t, tipo: 'Tela' })),
              ...alertas.avios.map(a => ({ ...a, tipo: 'Avío' })),
            ].map(item => (
              <div key={`${item.tipo}-${item.id}`}
                className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{item.nombre}</p>
                  <p className="text-xs text-slate-400">{item.tipo} · {item.codigo}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold text-red-700">{item.stock_actual} {item.unidad}</p>
                  <p className="text-xs text-slate-400">mín. {item.stock_minimo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dashboard Empleado ────────────────────────────────────────────────────────
function DashboardEmpleado() {
  const { user } = useAuthStore()
  const [prod,  setProd]  = useState(null)
  const [pagos, setPagos] = useState(null)
  const [asist, setAsist] = useState(null)

  const hoy   = new Date()
  const fin   = hoy.toISOString().slice(0, 10)
  const ini   = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`
  const hace4 = new Date(hoy); hace4.setDate(hoy.getDate() - 27)

  useEffect(() => {
    Promise.all([
      getPortalProduccion({ desde: hace4.toISOString().slice(0,10), hasta: fin }),
      getPortalPagos(),
      getPortalAsistencia({ desde: ini, hasta: fin }),
    ]).then(([p, pg, a]) => {
      setProd(p.data); setPagos(pg.data); setAsist(a.data)
    }).catch(() => {})
  }, [])

  const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
  const nombre = user?.empleado?.nombre ?? user?.name ?? 'empleada'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">¡Bienvenida, {nombre}!</h2>
        <p className="text-slate-500 text-sm mt-0.5">Resumen de tu actividad reciente</p>
      </div>

      {/* KPIs personales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Piezas (últimas 4 sem.)</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{prod?.total_piezas?.toLocaleString() ?? '—'}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-medium">Importe (últimas 4 sem.)</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{prod ? fmt(prod.total_importe) : '—'}</p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p className="text-xs text-violet-600 font-medium">Total acumulado</p>
          <p className="text-2xl font-bold text-violet-900 mt-1">{pagos ? fmt(pagos.total_pagado) : '—'}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-700 font-medium">Días asistidos (mes)</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{asist?.total_dias ?? '—'}</p>
        </div>
      </div>

      {/* Accesos directos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { to: '/portal/produccion',   label: 'Mi Producción', icon: DocumentTextIcon,          bg: 'bg-blue-50   border-blue-200   hover:bg-blue-100',   ic: 'text-blue-600'   },
          { to: '/portal/pagos',        label: 'Mis Pagos',     icon: BanknotesIcon,             bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',ic: 'text-emerald-600'},
          { to: '/portal/asistencia',   label: 'Mi Asistencia', icon: CalendarDaysIcon,          bg: 'bg-amber-50  border-amber-200  hover:bg-amber-100',   ic: 'text-amber-600'  },
          { to: '/portal/permisos',     label: 'Mis Permisos',  icon: CalendarDaysIcon,          bg: 'bg-violet-50 border-violet-200 hover:bg-violet-100',   ic: 'text-violet-600' },
          { to: '/portal/ordenes',      label: 'Mis Órdenes',   icon: ClipboardDocumentListIcon, bg: 'bg-slate-50  border-slate-200  hover:bg-slate-100',    ic: 'text-slate-600'  },
          { to: '/portal/aclaraciones', label: 'Aclaraciones',  icon: ChatBubbleLeftEllipsisIcon,bg: 'bg-rose-50   border-rose-200   hover:bg-rose-100',     ic: 'text-rose-600'   },
        ].map(({ to, label, icon: Icon, bg, ic }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 border rounded-xl p-4 transition-colors ${bg}`}>
            <Icon className={`w-6 h-6 shrink-0 ${ic}`} />
            <span className="font-medium text-slate-700 text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Selector por rol ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore()
  if (user?.role === 'empleado') return <DashboardEmpleado />
  return <DashboardAdmin />
}
