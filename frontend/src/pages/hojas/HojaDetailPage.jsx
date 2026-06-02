import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getHoja, updateHoja, deleteHoja, addHojaOp, updateHojaOp, deleteHojaOp, getOperaciones, descargarHojaPdf } from '../../api/produccion'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import {
  ChevronLeftIcon, CalendarDaysIcon, ExclamationTriangleIcon,
  PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

// ── Utilidades de fecha ───────────────────────────────────────────────────────
const DIAS_FULL  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MESES      = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const moneda = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

function parseDate(str) {
  const [y,m,d] = (str ?? '').slice(0,10).split('-').map(Number)
  return new Date(y, m-1, d)
}
function toKey(d) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-')
}
function rangoFechas(ini, fin) {
  const days = []; const cur = parseDate(ini); const last = parseDate(fin)
  while (cur <= last) { days.push(new Date(cur)); cur.setDate(cur.getDate()+1) }
  return days
}

// ── Tarjeta de un día (calendario) ───────────────────────────────────────────
function DayCard({ date, ops, isToday, isWeekend }) {
  const dow = date.getDay()
  const totalPzs = ops.reduce((s,o) => s + Number(o.numero_piezas ?? 0), 0)
  const totalImp = ops.reduce((s,o) => s + Number(o.total_por_operacion ?? 0), 0)
  const conProd  = ops.length > 0

  return (
    <div className={['flex flex-col rounded-2xl border overflow-hidden transition-shadow', conProd ? 'bg-white border-blue-200 shadow-md' : isWeekend ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'].join(' ')}>
      <div className={['px-3 py-2 flex items-end justify-between', isToday ? 'bg-blue-600 text-white' : conProd ? 'bg-blue-50 text-blue-800' : isWeekend ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-500'].join(' ')}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest leading-none">{DIAS_CORTO[dow]}</p>
          <p className="text-2xl font-black leading-tight">{date.getDate()}</p>
          <p className="text-[11px] leading-none">{MESES[date.getMonth()]}</p>
        </div>
        {isToday && <span className="text-[10px] bg-white text-blue-600 font-bold px-1.5 py-0.5 rounded-full">HOY</span>}
      </div>
      <div className="flex-1 p-2 space-y-1.5 min-h-[100px]">
        {!conProd ? (
          <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-300">—</span></div>
        ) : ops.map((op,i) => (
          <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl px-2.5 py-2">
            <p className="text-[11px] font-semibold text-blue-800 leading-tight line-clamp-2">{op.operacion?.nombre ?? `Op #${op.operacion_prenda_id}`}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-blue-600 font-bold">{Number(op.numero_piezas).toLocaleString('es-MX')} pzas</span>
              <span className="text-[11px] text-blue-700 font-medium">{moneda(op.total_por_operacion)}</span>
            </div>
          </div>
        ))}
      </div>
      {conProd && (
        <div className="bg-blue-600 px-3 py-2 flex justify-between items-center">
          <span className="text-xs text-blue-100 font-semibold">{totalPzs.toLocaleString('es-MX')} pzas</span>
          <span className="text-xs text-white font-bold">{moneda(totalImp)}</span>
        </div>
      )}
    </div>
  )
}

// ── Fila de operación (inline edit) ──────────────────────────────────────────
function OpRow({ op, operaciones, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form, setForm]       = useState({ operacion_prenda_id: String(op.operacion_prenda_id), numero_piezas: String(op.numero_piezas), total_por_operacion: String(op.total_por_operacion), fecha: (op.fecha ?? '').slice(0,10) })

  const set = (k) => (e) => {
    const val = e.target.value
    setForm(f => {
      const updated = { ...f, [k]: val }
      if (k === 'operacion_prenda_id' || k === 'numero_piezas') {
        const o   = operaciones.find(x => String(x.id) === String(k === 'operacion_prenda_id' ? val : updated.operacion_prenda_id))
        const qty = parseFloat(k === 'numero_piezas' ? val : updated.numero_piezas) || 0
        if (o && qty > 0) updated.total_por_operacion = (parseFloat(o.precio) * qty).toFixed(2)
      }
      return updated
    })
  }

  const save = async () => {
    setSaving(true)
    try { await updateHojaOp(op.id, form); await onSaved(); setEditing(false) }
    catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const del = async () => {
    if (!window.confirm('¿Eliminar esta operación?')) return
    setSaving(true)
    try { await deleteHojaOp(op.id); await onDeleted(); toast.success('Operación eliminada') }
    catch { toast.error('Error al eliminar') }
    finally { setSaving(false) }
  }

  const d = parseDate(op.fecha ?? '')

  if (editing) return (
    <tr className="bg-blue-50 border-b border-blue-100">
      <td className="px-3 py-2">
        <input type="date" value={form.fecha} onChange={set('fecha')}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2 text-slate-400 text-xs">{DIAS_FULL[parseDate(form.fecha).getDay()]}</td>
      <td className="px-3 py-2">
        <select value={form.operacion_prenda_id} onChange={set('operacion_prenda_id')}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
          {operaciones.map(o => <option key={o.id} value={o.id}>{o.nombre} — ${o.precio}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input type="number" value={form.numero_piezas} onChange={set('numero_piezas')} min="0"
          className="border border-slate-300 rounded px-2 py-1 text-xs w-20 text-right focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2">
        <input type="number" value={form.total_por_operacion} onChange={set('total_por_operacion')} min="0" step="0.01"
          className="border border-emerald-300 bg-emerald-50 rounded px-2 py-1 text-xs w-24 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40"><CheckIcon className="w-4 h-4" /></button>
          <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  )

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 group transition-colors">
      <td className="px-4 py-2.5 text-slate-500 tabular-nums text-sm">{(op.fecha ?? '').slice(0,10)}</td>
      <td className="px-4 py-2.5 text-slate-500 text-sm">{DIAS_FULL[d.getDay()]}</td>
      <td className="px-4 py-2.5 font-medium text-slate-700">{op.operacion?.nombre ?? '—'}</td>
      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-700">{Number(op.numero_piezas).toLocaleString('es-MX')}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{moneda(op.total_por_operacion)}</td>
      <td className="px-4 py-2.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-3.5 h-3.5" /></button>
          <button onClick={del} disabled={saving} className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  )
}

// ── Fila para agregar nueva operación ─────────────────────────────────────────
function NewOpRow({ hojaId, operaciones, fechaDefault, onAdded, onCancel }) {
  const [form, setForm] = useState({ operacion_prenda_id: '', numero_piezas: '', total_por_operacion: '', fecha: fechaDefault })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => {
    const val = e.target.value
    setForm(f => {
      const updated = { ...f, [k]: val }
      if (k === 'operacion_prenda_id' || k === 'numero_piezas') {
        const o   = operaciones.find(x => String(x.id) === String(k === 'operacion_prenda_id' ? val : updated.operacion_prenda_id))
        const qty = parseFloat(k === 'numero_piezas' ? val : updated.numero_piezas) || 0
        if (o && qty > 0) updated.total_por_operacion = (parseFloat(o.precio) * qty).toFixed(2)
      }
      return updated
    })
  }

  const save = async () => {
    if (!form.operacion_prenda_id || !form.numero_piezas || !form.fecha) { toast.error('Completa todos los campos'); return }
    setSaving(true)
    try {
      await addHojaOp(hojaId, form)
      toast.success('Operación agregada')
      await onAdded()
    } catch { toast.error('Error al agregar') }
    finally { setSaving(false) }
  }

  return (
    <tr className="bg-emerald-50/50 border-b border-emerald-100">
      <td className="px-3 py-2">
        <input type="date" value={form.fecha} onChange={set('fecha')}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2 text-slate-400 text-xs italic">nueva</td>
      <td className="px-3 py-2">
        <select value={form.operacion_prenda_id} onChange={set('operacion_prenda_id')}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
          <option value="">Seleccionar operación...</option>
          {operaciones.map(o => <option key={o.id} value={o.id}>{o.nombre} — ${o.precio}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input type="number" value={form.numero_piezas} onChange={set('numero_piezas')} min="0" placeholder="Piezas"
          className="border border-slate-300 rounded px-2 py-1 text-xs w-20 text-right focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2">
        <input type="number" value={form.total_por_operacion} onChange={set('total_por_operacion')} min="0" step="0.01" placeholder="Total"
          className="border border-emerald-300 bg-emerald-50 rounded px-2 py-1 text-xs w-24 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40"><CheckIcon className="w-4 h-4" /></button>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA
// ══════════════════════════════════════════════════════════════════════════════
export default function HojaDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [hoja, setHoja]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [operaciones, setOps]     = useState([])   // catálogo de operaciones
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [addingOp, setAddingOp]   = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const handlePdf = async () => {
    setPdfLoading(true)
    try { await descargarHojaPdf(id) }
    catch { toast.error('Error al generar el PDF') }
    finally { setPdfLoading(false) }
  }

  const reload = useCallback(async () => {
    const r = await getHoja(id); setHoja(r.data)
  }, [id])

  useEffect(() => {
    Promise.all([getHoja(id), getOperaciones({ per_page: 200 })])
      .then(([h, ops]) => { setHoja(h.data); setOps(ops.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const openEdit = () => {
    setEditForm({
      fecha_inicio:    hoja.fecha_inicio?.slice(0,10) ?? '',
      fecha_fin:       hoja.fecha_fin?.slice(0,10)   ?? '',
      dias_inhabiles:  String(hoja.dias_inhabiles ?? 0),
      fecha_registro:  hoja.fecha_registro?.slice(0,10) ?? '',
      observaciones:   hoja.observaciones ?? '',
    })
    setEditModal(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await updateHoja(id, editForm); toast.success('Hoja actualizada'); setEditModal(false); reload() }
    catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta hoja de producción? Esta acción no se puede deshacer.')) return
    try { await deleteHoja(id); toast.success('Hoja eliminada'); navigate('/hojas-produccion') }
    catch { toast.error('No se pudo eliminar (puede estar incluida en un corte de nómina)') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>
  if (!hoja)   return <p className="text-center text-slate-400 py-10">Hoja no encontrada</p>

  const dias       = rangoFechas(hoja.fecha_inicio, hoja.fecha_fin)
  const opsPorDia  = {}
  ;(hoja.operaciones ?? []).forEach(op => {
    const key = (op.fecha ?? '').slice(0,10)
    ;(opsPorDia[key] ??= []).push(op)
  })
  const totalPiezas = (hoja.operaciones ?? []).reduce((s,o) => s + Number(o.numero_piezas ?? 0), 0)
  const diasConProd = Object.keys(opsPorDia).length
  const todayKey    = toKey(new Date())
  const opsOrdenadas = [...(hoja.operaciones ?? [])].sort((a,b) => (a.fecha ?? '') > (b.fecha ?? '') ? 1 : -1)

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <Link to="/hojas-produccion" className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">
            Hoja de producción <span className="text-blue-600">#{hoja.id}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="font-medium text-slate-700">{hoja.empleado?.apellidos} {hoja.empleado?.nombre}</span>
            {hoja.orden && <> · <span className="font-medium text-slate-600">{hoja.orden.codigo}</span>{hoja.orden.cliente && <span className="text-slate-400"> — {hoja.orden.cliente.nombre}</span>}</>}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Período: <strong className="text-slate-600">{hoja.fecha_inicio?.slice(0,10)}</strong> → <strong className="text-slate-600">{hoja.fecha_fin?.slice(0,10)}</strong>
            {hoja.dias_inhabiles > 0 && <span className="ml-2 text-amber-600">({hoja.dias_inhabiles} día{hoja.dias_inhabiles > 1 ? 's' : ''} inhábil)</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right bg-blue-50 rounded-xl px-4 py-2 border border-blue-100">
            <p className="text-[11px] text-blue-500 font-semibold uppercase tracking-wide">Piezas</p>
            <p className="text-xl font-black text-blue-700">{totalPiezas.toLocaleString('es-MX')}</p>
          </div>
          <div className="text-right bg-green-50 rounded-xl px-4 py-2 border border-green-100">
            <p className="text-[11px] text-green-500 font-semibold uppercase tracking-wide">Total a pagar</p>
            <p className="text-xl font-black text-green-700">{moneda(hoja.total_a_pagar)}</p>
          </div>
          <button onClick={handlePdf} disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors disabled:opacity-50">
            <ArrowDownTrayIcon className="w-4 h-4" /> {pdfLoading ? 'Generando…' : 'PDF'}
          </button>
          <button onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors">
            <PencilIcon className="w-4 h-4" /> Editar
          </button>
          <button onClick={handleDelete}
            className="p-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendario */}
      <section>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4" /> Producción por día
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(dias.length, 7)}, minmax(0, 1fr))` }}>
          {dias.map(d => {
            const key = toKey(d); const dow = d.getDay()
            return <DayCard key={key} date={d} ops={opsPorDia[key] ?? []} isToday={key === todayKey} isWeekend={dow === 0 || dow === 6} />
          })}
        </div>
        <div className="flex flex-wrap gap-5 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" />Con producción</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />Sin producción</span>
          <span className="ml-auto font-medium text-slate-500">{diasConProd} de {dias.length} días con producción</span>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Operaciones', val: hoja.operaciones?.length ?? 0 },
          { label: 'Días con prod.', val: `${diasConProd} / ${dias.length}` },
          { label: 'Promedio diario', val: diasConProd > 0 ? `${Math.round(totalPiezas / diasConProd).toLocaleString('es-MX')} pzas` : '—' },
          { label: 'Días inhábiles', val: hoja.dias_inhabiles ?? 0 },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-slate-700 mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      {/* Tabla de operaciones (editable) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 text-sm">Detalle de operaciones</h3>
          <button onClick={() => setAddingOp(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <PlusIcon className="w-3.5 h-3.5" /> Agregar operación
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Fecha','Día','Operación','Piezas','Total',''].map(h => (
                <th key={h} className={`px-4 py-2.5 text-left text-xs font-semibold text-slate-500 ${h === 'Piezas' || h === 'Total' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opsOrdenadas.map(op => (
              <OpRow key={op.id} op={op} operaciones={operaciones} onSaved={reload} onDeleted={reload} />
            ))}
            {addingOp && (
              <NewOpRow
                hojaId={id}
                operaciones={operaciones}
                fechaDefault={hoja.fecha_inicio?.slice(0,10) ?? ''}
                onAdded={async () => { await reload(); setAddingOp(false) }}
                onCancel={() => setAddingOp(false)}
              />
            )}
            {opsOrdenadas.length === 0 && !addingOp && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin operaciones registradas. Haz clic en "Agregar operación".</td></tr>
            )}
          </tbody>
          {opsOrdenadas.length > 0 && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">TOTAL</td>
                <td className="px-4 py-3 text-right font-black text-slate-800 tabular-nums">{totalPiezas.toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 text-right font-black text-slate-800">{moneda(hoja.total_a_pagar)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
        <p className="px-5 py-2 text-xs text-slate-400 border-t border-slate-100">
          Pasa el cursor sobre una fila para editar o eliminar. El total se recalcula automáticamente.
        </p>
      </div>

      {/* Eventualidades */}
      {(hoja.eventualidades?.length ?? 0) > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h3 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" /> Eventualidades registradas
          </h3>
          <ul className="space-y-2">
            {hoja.eventualidades.map(ev => (
              <li key={ev.id} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span><strong>{ev.nombre}</strong>{ev.descripcion ? ` — ${ev.descripcion}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal editar hoja */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar hoja de producción">
        <form onSubmit={saveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio *" type="date" value={editForm.fecha_inicio} onChange={e => setEditForm(f => ({...f, fecha_inicio: e.target.value}))} required />
            <Input label="Fecha fin *" type="date" value={editForm.fecha_fin} onChange={e => setEditForm(f => ({...f, fecha_fin: e.target.value}))} required />
            <Input label="Días inhábiles" type="number" min="0" value={editForm.dias_inhabiles} onChange={e => setEditForm(f => ({...f, dias_inhabiles: e.target.value}))} />
            <Input label="Fecha de registro" type="date" value={editForm.fecha_registro} onChange={e => setEditForm(f => ({...f, fecha_registro: e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={editForm.observaciones} onChange={e => setEditForm(f => ({...f, observaciones: e.target.value}))} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
