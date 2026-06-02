import { useEffect, useState, useCallback } from 'react'
import { getReporteProduccion, getReporteOrdenes, getReporteInventario } from '../../api/reportes'
import {
  DocumentTextIcon, ClipboardDocumentListIcon,
  ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'

const fmt  = (n) => Number(n ?? 0).toLocaleString('es-MX', { style:'currency', currency:'MXN' })
const fnum = (n) => Number(n ?? 0).toLocaleString('es-MX')

const TABS = [
  { id: 'produccion', label: 'Producción', icon: DocumentTextIcon },
  { id: 'ordenes',    label: 'Órdenes',    icon: ClipboardDocumentListIcon },
  { id: 'inventario', label: 'Inventario', icon: ExclamationTriangleIcon },
]

// ── Tab: Reporte de Producción ────────────────────────────────────────────────
function TabProduccion() {
  const hoy   = new Date().toISOString().slice(0, 10)
  const priDia= `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-01`

  const [desde, setDesde] = useState(priDia)
  const [hasta, setHasta] = useState(hoy)
  const [data,  setData]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const { data: d } = await getReporteProduccion({ desde, hasta })
      setData(d)
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  useEffect(() => { cargar() }, [cargar])

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const maxPagado = Math.max(...(data?.empleados ?? []).map(e => e.total_pagado), 1)

  return (
    <div className="space-y-5">
      {/* Filtros de fecha */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando…</div>
      ) : !data ? null : (
        <>
          {/* Totales globales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs text-emerald-600 font-medium">Total a pagar</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{fmt(data.total_pagado)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Hojas de producción</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{data.total_hojas}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Empleados con producción</p>
              <p className="text-2xl font-bold text-slate-700 mt-1">{data.empleados.length}</p>
            </div>
          </div>

          {/* Tabla por empleado */}
          {data.empleados.length === 0 ? (
            <p className="text-center py-12 text-slate-400">Sin hojas de producción en el período</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Empleado','Hojas','Total a pagar','Participación',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.empleados
                    .sort((a, b) => b.total_pagado - a.total_pagado)
                    .map(emp => (
                    <>
                      <tr key={emp.empleado_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {emp.apellidos} {emp.nombre}
                          {emp.status === 'inactivo' && (
                            <span className="ml-2 text-xs text-slate-400">(inactivo)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{emp.total_hojas}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{fmt(emp.total_pagado)}</td>
                        <td className="px-4 py-3 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(emp.total_pagado / maxPagado) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-10 text-right">
                              {data.total_pagado > 0 ? Math.round((emp.total_pagado / data.total_pagado) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggle(emp.empleado_id)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Ver hojas"
                          >
                            {expanded[emp.empleado_id]
                              ? <ChevronDownIcon className="w-4 h-4" />
                              : <ChevronRightIcon className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {expanded[emp.empleado_id] && emp.hojas.map(h => (
                        <tr key={h.id} className="bg-emerald-50/50">
                          <td className="px-8 py-2 text-xs text-slate-500 italic">
                            Hoja #{h.id} · {h.fecha_inicio} al {h.fecha_fin}
                          </td>
                          <td colSpan={2} className="px-4 py-2 text-xs text-emerald-700 font-semibold">
                            {fmt(h.total_a_pagar)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Tab: Reporte de Órdenes ───────────────────────────────────────────────────
function TabOrdenes() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReporteOrdenes().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const STATUS_LABEL = { pendiente:'Pendiente', en_proceso:'En proceso', completada:'Completada', cancelada:'Cancelada' }
  const STATUS_COLOR = {
    pendiente:  'bg-slate-100 text-slate-600',
    en_proceso: 'bg-blue-100 text-blue-800',
    completada: 'bg-emerald-100 text-emerald-800',
    cancelada:  'bg-red-100 text-red-700',
  }
  const PRIO_COLOR = {
    alta:  'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-800',
    baja:  'bg-slate-100 text-slate-600',
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Cargando…</div>
  if (!data)   return null

  const total = Object.values(data.por_status).reduce((s, n) => s + n, 0)

  return (
    <div className="space-y-6">
      {/* Distribución por status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Distribución por estado</h3>
        <div className="space-y-3">
          {Object.entries(data.por_status).map(([status, count]) => (
            <div key={status} className="flex items-center gap-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-28 text-center ${STATUS_COLOR[status] ?? STATUS_COLOR.pendiente}`}>
                {STATUS_LABEL[status] ?? status}
              </span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas entregas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Próximas entregas (pendientes / en proceso)</h3>
        {data.proximas_entregas.length === 0 ? (
          <p className="text-slate-400 text-sm">Sin entregas próximas con fecha definida</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Orden','Modelo','Cliente','Fecha entrega','Días restantes','Prioridad'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-500 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.proximas_entregas.map(o => {
                  const dias  = Math.round(o.dias_restantes)
                  const dCol  = dias < 0 ? 'text-red-600 font-bold' : dias <= 3 ? 'text-orange-500 font-semibold' : 'text-slate-600'
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono text-blue-700">{o.codigo}</td>
                      <td className="py-3 pr-4 text-slate-700">{o.modelo}</td>
                      <td className="py-3 pr-4 text-slate-500 max-w-[140px] truncate">{o.cliente ?? '—'}</td>
                      <td className="py-3 pr-4 text-slate-600">{o.fecha_entrega}</td>
                      <td className={`py-3 pr-4 ${dCol}`}>
                        {dias < 0 ? `${Math.abs(dias)}d vencida` : dias === 0 ? 'Hoy' : `${dias}d`}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIO_COLOR[o.prioridad] ?? PRIO_COLOR.baja}`}>
                          {o.prioridad ?? '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Reporte de Inventario ────────────────────────────────────────────────
function TabInventario() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReporteInventario().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-slate-400">Cargando…</div>
  if (!data)   return null

  const Section = ({ title, items, tipo }) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          items.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {items.length > 0 ? `${items.length} alerta${items.length !== 1 ? 's' : ''}` : 'OK'}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-slate-400 text-sm">
          Todo el stock está sobre el mínimo ✓
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {['Código','Nombre', tipo === 'avio' ? 'Categoría' : null,'Stock actual','Stock mínimo','Unidad'].filter(Boolean).map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-red-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.nombre}</td>
                {tipo === 'avio' && <td className="px-4 py-3 text-slate-500 capitalize">{item.categoria}</td>}
                <td className="px-4 py-3 font-bold text-red-600">{fnum(item.stock_actual)}</td>
                <td className="px-4 py-3 text-slate-400">{fnum(item.stock_minimo)}</td>
                <td className="px-4 py-3 text-slate-500">{item.unidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      {data.total_alertas === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="font-semibold text-emerald-800">Todo el inventario está sobre los niveles mínimos</p>
        </div>
      )}
      <Section title="Telas bajo mínimo"  items={data.telas_bajo_minimo} tipo="tela" />
      <Section title="Avíos bajo mínimo"  items={data.avios_bajo_minimo} tipo="avio" />
    </div>
  )
}

// ── Página principal de Reportes ──────────────────────────────────────────────
export default function ReportesPage() {
  const [tab, setTab] = useState('produccion')

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'produccion' && <TabProduccion />}
      {tab === 'ordenes'    && <TabOrdenes />}
      {tab === 'inventario' && <TabInventario />}
    </div>
  )
}
