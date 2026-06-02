import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getHojas } from '../../api/produccion'
import { getEmpleados } from '../../api/empleados'
import { getOrdenes } from '../../api/ordenes'
import HojaForm from './HojaForm'
import ProduccionEmpleadoModal from './ProduccionEmpleadoModal'
import QRScanner from '../../components/ui/QRScanner'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, ChevronLeftIcon, ChevronRightIcon,
  QrCodeIcon, TableCellsIcon, CalendarDaysIcon,
  UserGroupIcon, ListBulletIcon, FunnelIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

// ── Helpers de fecha ──────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]

function parseLocal(str) {
  const [y, m, d] = (str ?? '').split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function addDays(dateStr, n) {
  const d = parseLocal(dateStr); d.setDate(d.getDate() + n); return toKey(d)
}

function weekMonday(dateStr) {
  const d = parseLocal(dateStr)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toKey(d)
}

function monthStart(dateStr) {
  const d = parseLocal(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function monthEnd(dateStr) {
  const d = parseLocal(dateStr)
  return toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

function daysInRange(desde, hasta) {
  const days = []
  const cur = parseLocal(desde), end = parseLocal(hasta)
  while (cur <= end) { days.push(toKey(cur)); cur.setDate(cur.getDate() + 1) }
  return days
}

function fmtShort(dateStr) {
  return parseLocal(dateStr).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtDay(dateStr) {
  return parseLocal(dateStr).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtMonth(dateStr) {
  return parseLocal(dateStr).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}
function fmtWeek(desde, hasta) {
  const a = parseLocal(desde).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  const b = parseLocal(hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${a} – ${b}`
}

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const moneda = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

// ── Construir mapa empId → dateKey → hoja[] ───────────────────────────────────
function buildHojaMap(hojas) {
  const map = {}
  hojas.forEach(h => {
    const empId = String(h.empleado_id)
    if (!map[empId]) map[empId] = {}
    const start = parseLocal(h.fecha_inicio), end = parseLocal(h.fecha_fin)
    const cur = new Date(start)
    while (cur <= end) {
      const key = toKey(cur)
      if (!map[empId][key]) map[empId][key] = []
      map[empId][key].push(h)
      cur.setDate(cur.getDate() + 1)
    }
  })
  return map
}

// ── Vista: DÍA ────────────────────────────────────────────────────────────────
function DayView({ date, empleados, hojaMap, highlightId, onOpenForm, onViewEmp }) {
  return (
    <div className="space-y-2">
      {empleados.map(emp => {
        const hojaList = hojaMap[String(emp.id)]?.[date] ?? []
        const hasHoja  = hojaList.length > 0
        const hoja     = hojaList[0]
        const isHL     = highlightId === emp.id

        return (
          <div
            key={emp.id}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
              isHL       ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300' :
              hasHoja    ? 'border-emerald-200 bg-emerald-50/60'             :
              'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${hasHoja ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {emp.nombre[0]}{emp.apellidos[0]}
            </div>

            {/* Info empleado */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {emp.apellidos} {emp.nombre}
                <span className="ml-2 text-xs font-normal text-slate-400">#{emp.numero_huella}</span>
              </p>
              {hasHoja ? (
                <p className="text-xs text-emerald-700">
                  ✓ {hojaList.length} hoja{hojaList.length > 1 ? 's' : ''} · {moneda(hojaList.reduce((s, h) => s + Number(h.total_a_pagar ?? 0), 0))}
                  {hoja.orden && <span className="ml-1 text-emerald-600"> — {hoja.orden.codigo}</span>}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Sin hoja de producción registrada</p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 shrink-0">
              {hasHoja && (
                <>
                  <button onClick={() => onViewEmp(emp)} className="text-xs text-blue-600 hover:underline">Historial</button>
                  {hojaList.map(h => (
                    <Link key={h.id} to={`/hojas-produccion/${h.id}`} className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-2 py-0.5 rounded hover:border-blue-300 transition-colors">
                      #{h.id}
                    </Link>
                  ))}
                </>
              )}
              <button
                onClick={() => onOpenForm(emp.id, date, date)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  hasHoja
                    ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                {hasHoja ? 'Agregar' : 'Nueva hoja'}
              </button>
            </div>
          </div>
        )
      })}
      {empleados.length === 0 && (
        <p className="text-center text-slate-400 py-8">Sin empleados activos</p>
      )}
    </div>
  )
}

// ── Vista: SEMANA ─────────────────────────────────────────────────────────────
function WeekView({ days, empleados, hojaMap, highlightId, onOpenForm, onViewEmp, onDayClick }) {
  const isToday = (d) => d === today()
  const isWkend = (d) => { const dow = parseLocal(d).getDay(); return dow === 0 || dow === 6 }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border border-slate-200 sticky left-0 z-10 min-w-[10rem]">
              Empleado
            </th>
            {days.map(d => (
              <th
                key={d}
                onClick={() => onDayClick(d)}
                className={`px-2 py-2 text-center border border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors min-w-[7rem] ${
                  isToday(d) ? 'bg-blue-600 text-white' : isWkend(d) ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{DOW[parseLocal(d).getDay() === 0 ? 6 : parseLocal(d).getDay() - 1]}</div>
                <div className={`text-lg font-black ${isToday(d) ? 'text-white' : ''}`}>{parseLocal(d).getDate()}</div>
                <div className={`text-[10px] ${isToday(d) ? 'text-blue-100' : 'text-slate-400'}`}>{MESES[parseLocal(d).getMonth()]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {empleados.map(emp => {
            const isHL = highlightId === emp.id
            return (
              <tr key={emp.id} className={`group ${isHL ? 'bg-blue-50' : 'hover:bg-slate-50'} transition-colors`}>
                {/* Nombre empleado */}
                <td className={`px-4 py-2.5 border border-slate-200 sticky left-0 z-10 ${isHL ? 'bg-blue-50' : 'bg-white group-hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {emp.nombre[0]}{emp.apellidos[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-xs leading-tight">{emp.apellidos}</p>
                      <p className="text-slate-400 text-xs leading-tight">{emp.nombre}</p>
                    </div>
                    <button onClick={() => onViewEmp(emp)} className="ml-auto text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* Celdas por día */}
                {days.map(d => {
                  const hojaList = hojaMap[String(emp.id)]?.[d] ?? []
                  const hasHoja  = hojaList.length > 0
                  const wkend    = isWkend(d)

                  return (
                    <td
                      key={d}
                      className={`px-1 py-1 border border-slate-200 text-center align-middle ${wkend && !hasHoja ? 'bg-slate-50' : ''}`}
                    >
                      {hasHoja ? (
                        <div className="space-y-0.5">
                          {hojaList.map(h => (
                            <Link
                              key={h.id}
                              to={`/hojas-produccion/${h.id}`}
                              className="block w-full rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors px-1.5 py-1"
                            >
                              <div className="text-emerald-700 text-xs font-bold">{moneda(h.total_a_pagar)}</div>
                              {h.orden && <div className="text-emerald-500 text-[10px] truncate">{h.orden.codigo}</div>}
                            </Link>
                          ))}
                          <button
                            onClick={() => onOpenForm(emp.id, d, d)}
                            className="w-full text-[10px] text-slate-400 hover:text-blue-600 py-0.5 hover:underline"
                          >
                            + más
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => !wkend && onOpenForm(emp.id, d, d)}
                          disabled={wkend}
                          className={`w-full h-12 rounded-lg border border-dashed transition-colors ${
                            wkend
                              ? 'border-slate-200 cursor-default'
                              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 group/cell'
                          }`}
                        >
                          {!wkend && (
                            <PlusIcon className="w-4 h-4 text-slate-300 group-hover/cell:text-blue-500 mx-auto transition-colors" />
                          )}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Vista: MES ────────────────────────────────────────────────────────────────
function MonthView({ refDate, hojas, onDayClick }) {
  const start = monthStart(refDate)
  const end   = monthEnd(refDate)
  const firstDay  = parseLocal(start)
  const lastDay   = parseLocal(end)

  // Calcular el lunes de la primera semana del mes
  const startDow  = firstDay.getDay() // 0=dom
  const calStart  = new Date(firstDay)
  calStart.setDate(firstDay.getDate() - (startDow === 0 ? 6 : startDow - 1))

  // Construir 6 semanas × 7 días
  const weeks = []
  const cur   = new Date(calStart)
  while (cur <= lastDay || weeks.length < 4) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
    if (cur > lastDay && weeks.length >= 4) break
  }

  // Contar hojas por fecha
  const countByDate = {}
  hojas.forEach(h => {
    const cur2 = parseLocal(h.fecha_inicio)
    const end2 = parseLocal(h.fecha_fin)
    while (cur2 <= end2) {
      const k = toKey(cur2)
      countByDate[k] = (countByDate[k] ?? 0) + 1
      cur2.setDate(cur2.getDate() + 1)
    }
  })

  const hoy = today()

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Cabecera días */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {DOW.map(d => (
          <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      {/* Semanas */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-0">
          {week.map((date, di) => {
            const key    = toKey(date)
            const inMonth = key >= start && key <= end
            const count  = countByDate[key] ?? 0
            const isHoy  = key === hoy
            const isWknd = di === 5 || di === 6

            return (
              <div
                key={key}
                onClick={() => inMonth && onDayClick(key)}
                className={`min-h-[5rem] p-2 border-r border-slate-100 last:border-0 cursor-pointer transition-colors ${
                  !inMonth ? 'bg-slate-50 opacity-40 cursor-default' :
                  isWknd   ? 'bg-slate-50 hover:bg-slate-100' :
                             'hover:bg-blue-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                  isHoy ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}>
                  {date.getDate()}
                </div>
                {count > 0 && (
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-700 font-medium px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {count} hoja{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Vista: LISTA ──────────────────────────────────────────────────────────────
function ListView({ hojas, desde, hasta, empleados, ordenes, onOpenForm }) {
  const fmt  = (v) => (v ?? '').slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {['#','Empleado','Orden','Período','Registrado','Total',''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {hojas.map(h => (
            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{h.id}</td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {h.empleado ? `${h.empleado.apellidos} ${h.empleado.nombre}` : '—'}
              </td>
              <td className="px-4 py-3 text-slate-600 text-sm">{h.orden?.codigo ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{fmt(h.fecha_inicio)} → {fmt(h.fecha_fin)}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{fmt(h.fecha_registro)}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{moneda(h.total_a_pagar)}</td>
              <td className="px-4 py-3">
                <Link to={`/hojas-produccion/${h.id}`} className="text-xs text-blue-600 hover:underline">Ver →</Link>
              </td>
            </tr>
          ))}
          {hojas.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Sin hojas en el período seleccionado</td></tr>
          )}
        </tbody>
        {hojas.length > 0 && (
          <tfoot className="border-t-2 border-slate-200 bg-slate-50">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total período</td>
              <td className="px-4 py-3 font-black text-slate-800">{moneda(hojas.reduce((s, h) => s + Number(h.total_a_pagar ?? 0), 0))}</td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
const VIEWS = [
  { id: 'dia',    label: 'Día',     icon: CalendarDaysIcon },
  { id: 'semana', label: 'Semana',  icon: TableCellsIcon },
  { id: 'mes',    label: 'Mes',     icon: CalendarDaysIcon },
  { id: 'periodo',label: 'Período', icon: FunnelIcon },
  { id: 'lista',  label: 'Lista',   icon: ListBulletIcon },
]

export default function HojasProduccionPage() {
  const [view, setView]               = useState('semana')
  const [refDate, setRefDate]         = useState(today())
  const [periodoDesde, setPDesde]     = useState(today())
  const [periodoHasta, setPHasta]     = useState(today())
  const [hojas, setHojas]             = useState([])
  const [empleados, setEmpleados]     = useState([])
  const [ordenes, setOrdenes]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [formOpen, setFormOpen]       = useState(false)
  const [formDefaults, setFormDefaults] = useState({})
  const [scannerOpen, setScannerOpen] = useState(false)
  const [highlightEmp, setHighlightEmp] = useState(null)
  const [empModal, setEmpModal]       = useState(null)

  // ── Rango de fechas según vista ────────────────────────────────────────────
  const { desde, hasta, days } = useMemo(() => {
    switch (view) {
      case 'dia': {
        return { desde: refDate, hasta: refDate, days: [refDate] }
      }
      case 'semana': {
        const mon = weekMonday(refDate)
        const sun = addDays(mon, 6)
        return { desde: mon, hasta: sun, days: daysInRange(mon, sun) }
      }
      case 'mes': {
        const s = monthStart(refDate), e = monthEnd(refDate)
        return { desde: s, hasta: e, days: daysInRange(s, e) }
      }
      case 'periodo': {
        const d = periodoDesde || today()
        const h = periodoHasta || today()
        return { desde: d, hasta: h, days: daysInRange(d, h) }
      }
      default: {
        const mon = weekMonday(refDate), sun = addDays(mon, 6)
        return { desde: mon, hasta: sun, days: daysInRange(mon, sun) }
      }
    }
  }, [view, refDate, periodoDesde, periodoHasta])

  // ── Cargar hojas ───────────────────────────────────────────────────────────
  const loadHojas = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getHojas({ desde, hasta, per_page: 300 })
      setHojas(data.data ?? [])
    } finally { setLoading(false) }
  }, [desde, hasta])

  useEffect(() => { loadHojas() }, [loadHojas])
  useEffect(() => {
    getEmpleados({ per_page: 200, status: 'activo' }).then(r => setEmpleados(r.data.data))
    getOrdenes({ per_page: 200 }).then(r => setOrdenes(r.data.data))
  }, [])

  // ── Mapa hoja: empId → dateKey → hoja[] ───────────────────────────────────
  const hojaMap = useMemo(() => buildHojaMap(hojas), [hojas])

  // ── Navegación ─────────────────────────────────────────────────────────────
  const navigate = (dir) => {
    const delta = dir === 'next' ? 1 : -1
    if (view === 'dia')     setRefDate(d => addDays(d, delta))
    if (view === 'semana')  setRefDate(d => addDays(d, delta * 7))
    if (view === 'mes') {
      setRefDate(d => {
        const dt = parseLocal(d)
        dt.setMonth(dt.getMonth() + delta)
        return toKey(dt)
      })
    }
  }

  const goToday = () => setRefDate(today())

  // ── Título del período visible ─────────────────────────────────────────────
  const periodLabel = useMemo(() => {
    if (view === 'dia')    return fmtDay(refDate)
    if (view === 'semana') return fmtWeek(desde, hasta)
    if (view === 'mes')    return fmtMonth(refDate)
    if (view === 'periodo') return `${desde} — ${hasta}`
    return ''
  }, [view, refDate, desde, hasta])

  // ── Abrir formulario ───────────────────────────────────────────────────────
  const openForm = useCallback((empId = '', fi = refDate, ff = refDate) => {
    setFormDefaults({ empleado_id: String(empId), fecha_inicio: fi, fecha_fin: fi === ff ? fi : ff, fecha_registro: today() })
    setFormOpen(true)
  }, [refDate])

  // ── QR Scan ────────────────────────────────────────────────────────────────
  const handleScan = useCallback((code) => {
    setScannerOpen(false)
    const emp = empleados.find(e => e.numero_huella === code || String(e.id) === code || `EMP:${e.numero_huella}` === code)
    if (!emp) { toast.error(`No se encontró empleado con código "${code}"`); return }
    setHighlightEmp(emp.id)
    toast.success(`Empleado: ${emp.apellidos} ${emp.nombre}`)
    if (view === 'dia') {
      // En vista día: preguntar si abrir formulario
      setTimeout(() => openForm(emp.id, refDate, refDate), 300)
    }
    // Scroll al empleado
    setTimeout(() => {
      document.getElementById(`emp-row-${emp.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
  }, [empleados, view, refDate, openForm])

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const empConHoja = new Set(hojas.map(h => h.empleado_id)).size
    const totalPagar = hojas.reduce((s, h) => s + Number(h.total_a_pagar ?? 0), 0)
    return { total: hojas.length, empConHoja, totalPagar }
  }, [hojas])

  return (
    <div className="space-y-4">
      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Hojas en período</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{kpi.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Empleados con hoja</p>
          <p className="text-2xl font-bold text-slate-700 mt-0.5">{kpi.empConHoja} <span className="text-sm font-normal text-slate-400">/ {empleados.length}</span></p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total a pagar</p>
          <p className="text-2xl font-bold text-blue-700 mt-0.5">{moneda(kpi.totalPagar)}</p>
        </div>
      </div>

      {/* ── Toolbar principal ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        {/* Selector de vista */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                view === v.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <v.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Navegación de fecha */}
        {view !== 'periodo' && view !== 'lista' && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('prev')} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[14rem] text-center">{periodLabel}</span>
            <button onClick={() => navigate('next')} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              Hoy
            </button>
          </div>
        )}

        {/* Periodo personalizado */}
        {view === 'periodo' && (
          <div className="flex items-center gap-2">
            <input type="date" value={periodoDesde} onChange={e => setPDesde(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400 text-sm">→</span>
            <input type="date" value={periodoHasta} onChange={e => setPHasta(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Escanear empleado */}
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <QrCodeIcon className="w-4 h-4" />
            Escanear
          </button>
          {/* Nueva hoja */}
          <button
            onClick={() => openForm('', refDate, refDate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva hoja
          </button>
        </div>
      </div>

      {/* ── Indicador de carga ────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Cargando hojas del período…
        </div>
      )}

      {/* ── Vistas ───────────────────────────────────────────────────────── */}
      <div id="hojas-grid">
        {view === 'dia' && (
          <DayView
            date={refDate}
            empleados={empleados}
            hojaMap={hojaMap}
            highlightId={highlightEmp}
            onOpenForm={openForm}
            onViewEmp={setEmpModal}
          />
        )}

        {view === 'semana' && (
          <WeekView
            days={days}
            empleados={empleados}
            hojaMap={hojaMap}
            highlightId={highlightEmp}
            onOpenForm={openForm}
            onViewEmp={setEmpModal}
            onDayClick={(d) => { setRefDate(d); setView('dia') }}
          />
        )}

        {view === 'mes' && (
          <MonthView
            refDate={refDate}
            hojas={hojas}
            onDayClick={(d) => { setRefDate(d); setView('dia') }}
          />
        )}

        {(view === 'periodo') && (
          <WeekView
            days={days.slice(0, 14)}  // máx 14 días en la vista de período para legibilidad
            empleados={empleados}
            hojaMap={hojaMap}
            highlightId={highlightEmp}
            onOpenForm={openForm}
            onViewEmp={setEmpModal}
            onDayClick={(d) => { setRefDate(d); setView('dia') }}
          />
        )}

        {view === 'lista' && (
          <ListView
            hojas={hojas}
            desde={desde}
            hasta={hasta}
            empleados={empleados}
            ordenes={ordenes}
            onOpenForm={openForm}
          />
        )}
      </div>

      {/* ── HojaForm (pre-relleno desde el calendario) ───────────────────── */}
      <HojaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); loadHojas(); toast.success('Hoja creada') }}
        empleados={empleados}
        ordenes={ordenes}
        defaultValues={formDefaults}
      />

      {/* ── Modal historial de empleado ───────────────────────────────────── */}
      {empModal && (
        <ProduccionEmpleadoModal empleado={empModal} onClose={() => setEmpModal(null)} />
      )}

      {/* ── Scanner QR ────────────────────────────────────────────────────── */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        title="Escanear gafete del empleado"
        hint="Apunta la cámara al código QR o de barras del gafete"
      />
    </div>
  )
}
