import { useState, useEffect, useCallback } from 'react'
import { getProduccionEmpleado } from '../../api/empleados'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

// ── Utilidades de fecha ──────────────────────────────────────────────────────
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function toISO(d) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-')
}
function parseLocal(s) {
  const [y,m,d] = (s ?? '').slice(0,10).split('-').map(Number)
  return new Date(y, m-1, d)
}
function startOfWeek(d) {
  const r = new Date(d); r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); return r // lunes
}
function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function fmt(n) {
  return Number(n ?? 0).toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}

// ── Paleta de colores por orden (asignada dinámicamente) ─────────────────────
const PALETA = [
  { bg:'bg-blue-50',   border:'border-blue-200',  text:'text-blue-800',  badge:'bg-blue-100 text-blue-700' },
  { bg:'bg-violet-50', border:'border-violet-200', text:'text-violet-800',badge:'bg-violet-100 text-violet-700' },
  { bg:'bg-emerald-50',border:'border-emerald-200',text:'text-emerald-800',badge:'bg-emerald-100 text-emerald-700' },
  { bg:'bg-amber-50',  border:'border-amber-200',  text:'text-amber-800', badge:'bg-amber-100 text-amber-700' },
  { bg:'bg-rose-50',   border:'border-rose-200',   text:'text-rose-800',  badge:'bg-rose-100 text-rose-700' },
  { bg:'bg-cyan-50',   border:'border-cyan-200',   text:'text-cyan-800',  badge:'bg-cyan-100 text-cyan-700' },
]

// ── Tarjeta de un día ────────────────────────────────────────────────────────
function DiaCard({ date, ops, coloresPorOrden, isHoy }) {
  const dow       = date.getDay()
  const esFinde   = dow === 0 || dow === 6
  const conProd   = ops.length > 0
  const totalPzs  = ops.reduce((s,o) => s + Number(o.numero_piezas), 0)
  const totalImp  = ops.reduce((s,o) => s + Number(o.total), 0)

  return (
    <div className={[
      'flex flex-col rounded-xl border overflow-hidden min-h-[120px]',
      isHoy       ? 'border-blue-500 shadow-md shadow-blue-100' :
      conProd     ? 'border-slate-200 shadow-sm bg-white' :
      esFinde     ? 'border-slate-100 bg-slate-50/60 opacity-60' :
                    'border-slate-100 bg-white',
    ].join(' ')}>

      {/* cabecera */}
      <div className={[
        'px-2 py-1.5 flex items-center justify-between',
        isHoy   ? 'bg-blue-600 text-white' :
        conProd ? 'bg-slate-50' : 'bg-transparent',
      ].join(' ')}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isHoy ? 'text-blue-200' : 'text-slate-400'}`}>
            {DIAS[dow]}
          </span>
          <p className={`text-xl font-black leading-none ${isHoy ? 'text-white' : 'text-slate-700'}`}>
            {date.getDate()}
          </p>
        </div>
        {isHoy && <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full">HOY</span>}
        {conProd && !isHoy && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-600">{totalPzs.toLocaleString('es-MX')} pzas</p>
            <p className="text-[10px] text-slate-400">{fmt(totalImp)}</p>
          </div>
        )}
      </div>

      {/* operaciones */}
      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto max-h-48">
        {!conProd ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-slate-200">—</span>
          </div>
        ) : ops.map((op, i) => {
          const c = coloresPorOrden[op.orden_id] ?? PALETA[0]
          return (
            <div key={i} className={`${c.bg} ${c.border} border rounded-lg px-2 py-1.5`}>
              {/* orden */}
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${c.badge} mb-1`}>
                {op.orden_codigo ?? '—'}
              </span>
              {/* operación */}
              <p className={`text-[11px] font-semibold leading-tight ${c.text}`}>
                {op.operacion ?? '—'}
              </p>
              {/* piezas / monto */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] font-bold text-slate-600">
                  {Number(op.numero_piezas).toLocaleString('es-MX')} pzas
                </span>
                <span className="text-[11px] text-slate-500">{fmt(op.total)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* footer total del día */}
      {conProd && ops.length > 1 && (
        <div className="bg-slate-700 px-2 py-1 flex justify-between items-center">
          <span className="text-[10px] text-slate-300 font-semibold">
            {ops.length} ops · {totalPzs.toLocaleString('es-MX')} pzas
          </span>
          <span className="text-[10px] text-white font-bold">{fmt(totalImp)}</span>
        </div>
      )}
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
export default function ProduccionEmpleadoModal({ empleado, onClose }) {
  const hoy       = new Date()
  const [semana, setSemana]     = useState(startOfWeek(hoy))   // lunes de la semana visible
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [rango, setRango]       = useState('semana')            // 'semana' | 'mes'

  // Rango completo que se pide al backend (4 semanas hacia atrás)
  const desde = toISO(addDays(semana, rango === 'mes' ? -21 : 0))
  const hasta  = toISO(addDays(semana, rango === 'mes' ? 6 : 6))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getProduccionEmpleado(empleado.id, { desde, hasta })
      setData(r.data)
    } catch { setData(null) }
    finally { setLoading(false) }
  }, [empleado.id, desde, hasta])

  useEffect(() => { load() }, [load])

  // Días a mostrar
  const dias = Array.from({ length: rango === 'mes' ? 28 : 7 }, (_, i) =>
    addDays(semana, rango === 'mes' ? i - 21 : i)
  )

  // Agrupar operaciones por fecha
  const opsPorDia = {}
  ;(data?.operaciones ?? []).forEach(op => {
    ;(opsPorDia[op.fecha] ??= []).push(op)
  })

  // Paleta por orden_id
  const ordenIds = [...new Set((data?.operaciones ?? []).map(o => o.orden_id))]
  const coloresPorOrden = Object.fromEntries(ordenIds.map((id, i) => [id, PALETA[i % PALETA.length]]))

  const todayKey = toISO(hoy)
  const semanas  = rango === 'mes' ? 4 : 1

  // Semanas del rango para el encabezado
  const semanasRows = Array.from({ length: semanas }, (_, si) =>
    Array.from({ length: 7 }, (_, di) => addDays(semana, si * 7 - (semanas - 1) * 7 + di))
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">
              Producción del empleado
            </p>
            <h2 className="text-xl font-bold text-white">
              {empleado.apellidos} {empleado.nombre}
            </h2>
            {data && (
              <p className="text-slate-300 text-sm mt-0.5">
                {data.desde} → {data.hasta}
              </p>
            )}
          </div>

          {/* KPIs globales */}
          <div className="flex items-center gap-4 mr-4">
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <p className="text-[10px] text-slate-300 uppercase font-semibold tracking-wide">Total piezas</p>
              <p className="text-2xl font-black text-white">
                {(data?.total_piezas ?? 0).toLocaleString('es-MX')}
              </p>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <p className="text-[10px] text-slate-300 uppercase font-semibold tracking-wide">Total importe</p>
              <p className="text-2xl font-black text-emerald-400">
                {fmt(data?.total_importe ?? 0)}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* ── Controles ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">
              {rango === 'semana'
                ? `Semana del ${dias[0].getDate()} al ${dias[6].getDate()} de ${MESES[dias[0].getMonth()]} ${dias[0].getFullYear()}`
                : `${MESES[dias[0].getMonth()]} ${dias[0].getFullYear()} (4 semanas)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle semana/mes */}
            <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
              {['semana','mes'].map(r => (
                <button
                  key={r}
                  onClick={() => setRango(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    rango === r ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'semana' ? '1 semana' : '4 semanas'}
                </button>
              ))}
            </div>

            {/* Navegación */}
            <button
              onClick={() => setSemana(s => addDays(s, rango === 'mes' ? -28 : -7))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSemana(startOfWeek(hoy))}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-100 text-slate-600"
            >
              Hoy
            </button>
            <button
              onClick={() => setSemana(s => addDays(s, rango === 'mes' ? 28 : 7))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Leyenda de órdenes ── */}
        {ordenIds.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 py-2.5 border-b bg-white">
            {ordenIds.map(oid => {
              const c   = coloresPorOrden[oid]
              const op  = data.operaciones.find(o => o.orden_id === oid)
              return (
                <span key={oid} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${c.bg.replace('bg-','bg-').replace('-50','-400')}`} />
                  {op?.orden_codigo} — {op?.cliente}
                </span>
              )
            })}
          </div>
        )}

        {/* ── Calendario ── */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {semanasRows.map((semDias, si) => {
                const tieneData = semDias.some(d => opsPorDia[toISO(d)]?.length > 0)
                return (
                  <div key={si}>
                    {/* encabezado de semana */}
                    {semanas > 1 && (
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">
                        {`${semDias[0].getDate()} ${MESES_CORTO[semDias[0].getMonth()]} — ${semDias[6].getDate()} ${MESES_CORTO[semDias[6].getMonth()]}`}
                        {!tieneData && <span className="ml-2 font-normal normal-case">Sin producción</span>}
                      </p>
                    )}
                    <div className="grid grid-cols-7 gap-2">
                      {/* cabeceras días (solo primera semana) */}
                      {si === 0 && ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1">
                          {d}
                        </div>
                      ))}
                      {si === 0 && <div className="col-span-7 border-t border-slate-100 -mt-1 mb-1" />}
                      {semDias.map(d => (
                        <DiaCard
                          key={toISO(d)}
                          date={d}
                          ops={opsPorDia[toISO(d)] ?? []}
                          coloresPorOrden={coloresPorOrden}
                          isHoy={toISO(d) === todayKey}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sin datos */}
          {!loading && data && data.operaciones.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CalendarDaysIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin producción registrada en este período</p>
              <p className="text-sm mt-1">Navega a otro rango de fechas</p>
            </div>
          )}
        </div>

        {/* ── Resumen de órdenes ── */}
        {(data?.operaciones ?? []).length > 0 && (
          <div className="border-t px-5 pb-5 pt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Resumen por orden de producción
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ordenIds.map(oid => {
                const c    = coloresPorOrden[oid]
                const ops  = (data?.operaciones ?? []).filter(o => o.orden_id === oid)
                const pzas = ops.reduce((s,o) => s + Number(o.numero_piezas), 0)
                const imp  = ops.reduce((s,o) => s + Number(o.total), 0)
                const ref  = ops[0]
                return (
                  <div key={oid} className={`${c.bg} ${c.border} border rounded-xl p-3`}>
                    <p className={`text-xs font-bold ${c.text}`}>{ref?.orden_codigo}</p>
                    <p className="text-xs text-slate-500 truncate">{ref?.cliente}</p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm font-bold text-slate-700">{pzas.toLocaleString('es-MX')} pzas</span>
                      <span className="text-sm font-semibold text-slate-600">{fmt(imp)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
