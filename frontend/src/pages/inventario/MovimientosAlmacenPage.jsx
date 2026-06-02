import { useState, useEffect, useCallback } from 'react'
import { movimientosApi } from '../../api/inventario'
import {
  ArrowDownCircleIcon, ArrowUpCircleIcon,
  AdjustmentsHorizontalIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline'

const today = () => new Date().toISOString().split('T')[0]

const MOV_STYLE = {
  entrada:    { bg: 'bg-green-100 text-green-700',  icon: ArrowDownCircleIcon,       sign: '+' },
  salida:     { bg: 'bg-red-100 text-red-700',      icon: ArrowUpCircleIcon,         sign: '−' },
  ajuste:     { bg: 'bg-yellow-100 text-yellow-700',icon: AdjustmentsHorizontalIcon, sign: '~' },
  devolucion: { bg: 'bg-blue-100 text-blue-700',    icon: ArrowPathIcon,             sign: '+' },
}
const ITEM_STYLE = {
  tela: 'bg-purple-100 text-purple-700',
  avio: 'bg-orange-100 text-orange-700',
}

function MovBadge({ tipo }) {
  const s = MOV_STYLE[tipo] ?? { bg: 'bg-slate-100 text-slate-600', icon: AdjustmentsHorizontalIcon }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.bg}`}>
      <Icon className="w-3 h-3" />{tipo}
    </span>
  )
}

function fmt(n) { return Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }

// ── Resumen acumulado ─────────────────────────────────────────────────────────
function KpiBar({ rows }) {
  const entradas = rows.filter(r => ['entrada','devolucion'].includes(r.tipo_movimiento))
    .reduce((s, r) => s + Number(r.cantidad ?? 0), 0)
  const salidas = rows.filter(r => r.tipo_movimiento === 'salida')
    .reduce((s, r) => s + Number(r.cantidad ?? 0), 0)
  const valor = rows.reduce((s, r) => s + Number(r.cantidad ?? 0) * Number(r.costo_unitario ?? 0), 0)
  const byTipo = rows.reduce((acc, r) => {
    acc[r.tipo_movimiento] = (acc[r.tipo_movimiento] ?? 0) + 1; return acc
  }, {})

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Entradas (pág.)</p>
        <p className="text-2xl font-bold text-green-700 mt-1">{entradas.toLocaleString('es-MX')}</p>
        <p className="text-xs text-green-500 mt-0.5">{byTipo.entrada ?? 0} movimientos</p>
      </div>
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Salidas (pág.)</p>
        <p className="text-2xl font-bold text-red-700 mt-1">{salidas.toLocaleString('es-MX')}</p>
        <p className="text-xs text-red-500 mt-0.5">{byTipo.salida ?? 0} movimientos</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
        <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Ajustes</p>
        <p className="text-2xl font-bold text-yellow-700 mt-1">{byTipo.ajuste ?? 0}</p>
        <p className="text-xs text-yellow-500 mt-0.5">movimientos</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Valor total (pág.)</p>
        <p className="text-2xl font-bold text-blue-700 mt-1">{fmt(valor)}</p>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function MovimientosAlmacenPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [tipoItem, setTipoItem] = useState('')
  const [tipoMov, setTipoMov]   = useState('')
  const [search, setSearch]     = useState('')
  const [desde, setDesde]       = useState('')
  const [hasta, setHasta]       = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await movimientosApi.list({
        tipo_item:       tipoItem  || undefined,
        tipo_movimiento: tipoMov   || undefined,
        search:          search    || undefined,
        desde:           desde     || undefined,
        hasta:           hasta     || undefined,
        page,
        per_page: 30,
      })
      const data = r.data
      setRows(data?.data ?? [])
      setMeta(data)
    } finally { setLoading(false) }
  }, [tipoItem, tipoMov, search, desde, hasta, page])

  useEffect(() => { setPage(1) }, [tipoItem, tipoMov, search, desde, hasta])
  useEffect(() => { load() }, [load])

  const clearFilters = () => { setTipoItem(''); setTipoMov(''); setSearch(''); setDesde(''); setHasta('') }
  const hasFilters   = tipoItem || tipoMov || search || desde || hasta

  return (
    <div className="space-y-5">
      {/* KPI */}
      <KpiBar rows={rows} />

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Buscar artículo…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          <select value={tipoItem} onChange={e => setTipoItem(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los artículos</option>
            <option value="tela">Telas</option>
            <option value="avio">Avíos</option>
          </select>
          <select value={tipoMov} onChange={e => setTipoMov(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los movimientos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste</option>
            <option value="devolucion">Devolución</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { setDesde(''); setHasta('') }}
            className="text-xs text-slate-400 hover:text-slate-600 underline">Sin fecha</button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 underline ml-2">
              Limpiar todos los filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Cargando…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay movimientos con los filtros seleccionados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Movimiento</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Artículo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Cantidad</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Costo unit.</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Referencia / Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const s     = MOV_STYLE[row.tipo_movimiento] ?? { sign: '' }
                const total = Number(row.cantidad ?? 0) * Number(row.costo_unitario ?? 0)
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap text-xs">
                      {row.created_at?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ITEM_STYLE[row.tipo_item] ?? 'bg-slate-100 text-slate-600'}`}>
                        {row.tipo_item}
                      </span>
                    </td>
                    <td className="px-4 py-2.5"><MovBadge tipo={row.tipo_movimiento} /></td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.nombre_item ?? `#${row.item_id}`}</td>
                    <td className={`px-4 py-2.5 text-right font-mono font-semibold ${row.tipo_movimiento === 'salida' ? 'text-red-600' : 'text-green-600'}`}>
                      {s.sign}{Number(row.cantidad).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{row.unidad}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{fmt(row.costo_unitario)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-700">{fmt(total)}</td>
                    <td className="px-4 py-2.5 text-slate-400 max-w-[12rem] truncate text-xs">
                      {row.referencia ?? ''}{row.observaciones ? ` · ${row.observaciones}` : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Página {meta.current_page} de {meta.last_page} — {meta.total} registros</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹ Anterior</button>
            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors">Siguiente ›</button>
          </div>
        </div>
      )}
    </div>
  )
}
