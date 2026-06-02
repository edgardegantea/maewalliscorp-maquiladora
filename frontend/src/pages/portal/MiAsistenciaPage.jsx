import { useState, useEffect, useCallback } from 'react'
import { getPortalAsistencia } from '../../api/portal'
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function primerDiaMes(y, m) { return new Date(y, m, 1) }
function diasEnMes(y, m) { return new Date(y, m + 1, 0).getDate() }

// retorna 0=lun … 6=dom
function dowLunes(d) { return (d.getDay() + 6) % 7 }

function diffMinutes(h1, h2) {
  if (!h1 || !h2) return null
  const [a1, b1] = h1.split(':').map(Number)
  const [a2, b2] = h2.split(':').map(Number)
  return (a2 - a1) * 60 + (b2 - b1)
}

function formatHora(h) {
  if (!h) return '—'
  return h.slice(0, 5)
}

export default function MiAsistenciaPage() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selDia, setSelDia] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const y = anio, m = String(mes + 1).padStart(2, '0')
    const lastDay = diasEnMes(y, mes)
    try {
      const { data: d } = await getPortalAsistencia({
        desde: `${y}-${m}-01`,
        hasta: `${y}-${m}-${String(lastDay).padStart(2,'0')}`,
      })
      setData(d)
    } finally {
      setLoading(false)
    }
  }, [anio, mes])

  useEffect(() => { cargar() }, [cargar])

  const navMes = (dir) => {
    setSelDia(null)
    if (dir === 1) {
      if (mes === 11) { setMes(0); setAnio(a => a + 1) }
      else setMes(m => m + 1)
    } else {
      if (mes === 0) { setMes(11); setAnio(a => a - 1) }
      else setMes(m => m - 1)
    }
  }

  const registrosPorDia = {}
  if (data) {
    data.registros.forEach(r => {
      const k = (r.fecha ?? '').slice(0, 10)
      registrosPorDia[k] = r
    })
  }

  const totalDias = diasEnMes(anio, mes)
  const primerDow = dowLunes(primerDiaMes(anio, mes)) // 0=lun
  const celdas = primerDow + totalDias
  const filas = Math.ceil(celdas / 7)

  const selKey = selDia ? `${anio}-${String(mes+1).padStart(2,'0')}-${String(selDia).padStart(2,'0')}` : null
  const selReg = selKey ? registrosPorDia[selKey] : null

  const presentes = Object.keys(registrosPorDia).length
  const tardanzas = Object.values(registrosPorDia).filter(r => r.observaciones?.toLowerCase().includes('tarde')).length

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Mi Asistencia</h2>
      </div>

      {/* KPIs del mes */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-xs text-emerald-600 font-medium">Días asistidos</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{presentes}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-xs text-yellow-700 font-medium">Tardanzas</p>
            <p className="text-2xl font-bold text-yellow-800 mt-1">{tardanzas}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-xs text-red-600 font-medium">Faltas</p>
            <p className="text-2xl font-bold text-red-800 mt-1">
              {Math.max(0, /* días hábiles aprox */ Math.min(totalDias, hoy.getMonth() === mes && hoy.getFullYear() === anio ? hoy.getDate() : totalDias) - presentes)}
            </p>
          </div>
        </div>
      )}

      {/* Navegación mes */}
      <div className="flex items-center justify-between">
        <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-slate-800">
          {MESES[mes]} {anio}
        </h3>
        <button onClick={() => navMes(1)} className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Asistencia</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"/> Tardanza</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200 inline-block"/> Sin registro</span>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1">
            {/* Cabeceras */}
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
            ))}
            {/* Celdas */}
            {Array.from({ length: filas * 7 }, (_, i) => {
              const diaNum = i - primerDow + 1
              if (diaNum < 1 || diaNum > totalDias) {
                return <div key={i} />
              }
              const key = `${anio}-${String(mes+1).padStart(2,'0')}-${String(diaNum).padStart(2,'0')}`
              const reg = registrosPorDia[key]
              const esHoy = diaNum === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
              const esSel = selDia === diaNum
              const esFuturo = new Date(anio, mes, diaNum) > hoy
              const tarde = reg?.observaciones?.toLowerCase().includes('tarde')

              let bg = 'bg-slate-100 text-slate-400' // sin registro
              if (reg && tarde) bg = 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              else if (reg) bg = 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              else if (esFuturo) bg = 'bg-white border border-slate-200 text-slate-300'

              return (
                <button
                  key={i}
                  onClick={() => setSelDia(diaNum === selDia ? null : diaNum)}
                  className={`
                    relative rounded-xl py-3 text-sm font-semibold transition-all
                    ${bg}
                    ${esHoy ? 'ring-2 ring-blue-500' : ''}
                    ${esSel ? 'scale-105 shadow-lg' : 'hover:scale-105'}
                  `}
                >
                  {diaNum}
                  {reg && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${tarde ? 'bg-yellow-500' : 'bg-emerald-600'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Detalle del día seleccionado */}
          {selDia && (
            <div className={`rounded-xl border p-5 ${selReg ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-semibold text-slate-800 mb-3">
                {selDia} de {MESES[mes]} de {anio}
                {!selReg && <span className="ml-2 text-sm font-normal text-red-500">— Sin registro de asistencia</span>}
              </p>
              {selReg ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {[
                    ['Entrada',       selReg.entrada],
                    ['Salida comida', selReg.entrada_comida],
                    ['Regreso',       selReg.salida_comida],
                    ['Salida',        selReg.salida],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p className="text-xs text-slate-400 font-medium">{lbl}</p>
                      <p className="text-base font-bold text-slate-700 mt-0.5">{formatHora(val)}</p>
                    </div>
                  ))}
                  {selReg.observaciones && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-slate-400 font-medium">Observaciones</p>
                      <p className="text-sm text-yellow-700 mt-0.5">{selReg.observaciones}</p>
                    </div>
                  )}
                  {selReg.entrada && selReg.salida && (
                    <div className="col-span-2 sm:col-span-4 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-400 font-medium">Tiempo total</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {(() => {
                          const mins = diffMinutes(selReg.entrada, selReg.salida)
                          if (mins === null) return '—'
                          return `${Math.floor(mins/60)}h ${mins % 60}min`
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  )
}
