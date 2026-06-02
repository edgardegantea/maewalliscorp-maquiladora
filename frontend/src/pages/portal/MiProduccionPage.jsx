import { useState, useEffect, useCallback } from 'react'
import { getPortalProduccion } from '../../api/portal'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

// ── Utilidades ───────────────────────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_CORTO = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function toISO(d) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-')
}
function parseLocal(s) {
  const [y,m,d] = (s ?? '').slice(0,10).split('-').map(Number)
  return new Date(y, m-1, d)
}
function startOfWeek(d) {
  const r = new Date(d); r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); return r
}
function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function fmt(n) {
  return Number(n ?? 0).toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}

const PALETA = [
  { bg:'bg-blue-100',   border:'border-blue-300',  text:'text-blue-900',  dot:'bg-blue-500' },
  { bg:'bg-violet-100', border:'border-violet-300', text:'text-violet-900',dot:'bg-violet-500' },
  { bg:'bg-emerald-100',border:'border-emerald-300',text:'text-emerald-900',dot:'bg-emerald-500' },
  { bg:'bg-amber-100',  border:'border-amber-300',  text:'text-amber-900', dot:'bg-amber-500' },
  { bg:'bg-rose-100',   border:'border-rose-300',   text:'text-rose-900',  dot:'bg-rose-500' },
  { bg:'bg-cyan-100',   border:'border-cyan-300',   text:'text-cyan-900',  dot:'bg-cyan-500' },
]

function DiaCard({ date, ops, coloresPorOrden }) {
  const dow = date.getDay()
  const esFinde = dow === 0 || dow === 6
  const hoy = toISO(new Date()) === toISO(date)
  const totalPzs = ops.reduce((s,o) => s + Number(o.numero_piezas), 0)
  const totalImp = ops.reduce((s,o) => s + Number(o.total), 0)

  return (
    <div className={`rounded-xl border flex flex-col min-h-[140px] ${
      hoy ? 'border-blue-500 ring-2 ring-blue-200' :
      esFinde ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'
    }`}>
      {/* Cabecera del día */}
      <div className={`px-3 py-2 rounded-t-xl flex items-center justify-between ${
        hoy ? 'bg-blue-600 text-white' : esFinde ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-600'
      }`}>
        <span className="text-xs font-semibold">{DIAS_CORTO[(date.getDay()+6)%7]}</span>
        <span className={`text-sm font-bold ${hoy ? 'text-white' : 'text-slate-700'}`}>
          {date.getDate()}
        </span>
      </div>

      {/* Operaciones */}
      <div className="flex-1 p-2 space-y-1">
        {ops.length === 0 && (
          <p className="text-xs text-slate-300 text-center mt-4">—</p>
        )}
        {ops.map(op => {
          const c = coloresPorOrden[op.orden_id] ?? PALETA[0]
          return (
            <div key={op.id} className={`rounded-lg px-2 py-1 border ${c.bg} ${c.border}`}>
              <p className={`text-[11px] font-semibold truncate ${c.text}`}>{op.operacion}</p>
              <p className={`text-[10px] ${c.text} opacity-70`}>{op.numero_piezas} pzs · {fmt(op.total)}</p>
            </div>
          )
        })}
      </div>

      {/* Totales del día */}
      {ops.length > 0 && (
        <div className="px-3 py-1.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
          <span>{totalPzs} pzs</span>
          <span className="font-semibold text-emerald-600">{fmt(totalImp)}</span>
        </div>
      )}
    </div>
  )
}

export default function MiProduccionPage() {
  const [modo, setModo] = useState('semana') // 'semana' | 'mes'
  const [ancla, setAncla] = useState(() => startOfWeek(new Date()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const dias = modo === 'semana' ? 7 : 28
  const inicio = ancla
  const fin = addDays(ancla, dias - 1)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const { data: d } = await getPortalProduccion({ desde: toISO(inicio), hasta: toISO(fin) })
      setData(d)
    } finally {
      setLoading(false)
    }
  }, [toISO(inicio), toISO(fin)])

  useEffect(() => { cargar() }, [cargar])

  // Mapa de colores por orden_id
  const coloresPorOrden = {}
  let paletaIdx = 0
  if (data) {
    data.operaciones.forEach(op => {
      if (op.orden_id && !(op.orden_id in coloresPorOrden)) {
        coloresPorOrden[op.orden_id] = PALETA[paletaIdx++ % PALETA.length]
      }
    })
  }

  // Agrupar por fecha
  const opsPorDia = {}
  if (data) {
    data.operaciones.forEach(op => {
      const k = op.fecha?.slice(0,10) ?? ''
      if (!opsPorDia[k]) opsPorDia[k] = []
      opsPorDia[k].push(op)
    })
  }

  const fechas = Array.from({ length: dias }, (_, i) => addDays(ancla, i))

  const ordenesUnicas = [...new Map(
    (data?.operaciones ?? [])
      .filter(o => o.orden_id)
      .map(o => [o.orden_id, o])
  ).values()]

  const nav = (dir) => {
    setAncla(d => addDays(d, dir * dias))
  }

  const periodoLabel = () => {
    const ini = `${inicio.getDate()} ${MESES[inicio.getMonth()]}`
    const finStr = `${fin.getDate()} ${MESES[fin.getMonth()]} ${fin.getFullYear()}`
    return `${ini} – ${finStr}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Mi Producción</h2>
        </div>

        {/* KPIs */}
        {data && (
          <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-1.5 text-center">
              <p className="text-xs text-blue-600 font-medium">Piezas</p>
              <p className="text-lg font-bold text-blue-800">{data.total_piezas.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-1.5 text-center">
              <p className="text-xs text-emerald-600 font-medium">Importe</p>
              <p className="text-lg font-bold text-emerald-800">{Number(data.total_importe).toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg overflow-hidden border border-slate-300">
          {['semana','mes'].map(m => (
            <button
              key={m}
              onClick={() => { setModo(m); setAncla(startOfWeek(new Date())) }}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                modo === m ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'semana' ? '1 Semana' : '4 Semanas'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">{periodoLabel()}</span>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAncla(startOfWeek(new Date()))}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(dias,7)}, minmax(0,1fr))` }}
        >
          {fechas.map(d => (
            <DiaCard
              key={toISO(d)}
              date={d}
              ops={opsPorDia[toISO(d)] ?? []}
              coloresPorOrden={coloresPorOrden}
            />
          ))}
        </div>
      )}

      {/* Leyenda de órdenes */}
      {ordenesUnicas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ordenesUnicas.map(op => {
            const c = coloresPorOrden[op.orden_id]
            return (
              <span key={op.orden_id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`}/>
                {op.orden_codigo} — {op.cliente}
              </span>
            )
          })}
        </div>
      )}

      {/* Sin producción */}
      {data && data.operaciones.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Sin producción registrada en este período</p>
        </div>
      )}
    </div>
  )
}
