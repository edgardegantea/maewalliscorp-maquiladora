import { useEffect, useState, useCallback } from 'react'
import { getAsistencia, registrarAsistencia, updateAsistencia, getEmpleados } from '../../api/empleados'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { PlusIcon, TableCellsIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

const today   = () => new Date().toISOString().split('T')[0]
const fmtTime = (t) => t ? t.slice(0, 5) : '—'

// Genera los 7 días de la semana que contiene la fecha dada (lunes → domingo)
function weekDays(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()           // 0=dom, 1=lun...
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const mon = new Date(d); mon.setDate(d.getDate() + diffToMon)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon); dd.setDate(mon.getDate() + i)
    return dd.toISOString().split('T')[0]
  })
}

const TABLE_COLS = [
  { key: 'empleado', label: 'Empleado', render: (v) => v ? `${v.apellidos} ${v.nombre}` : '—' },
  { key: 'fecha',    label: 'Fecha' },
  { key: 'entrada',  label: 'Entrada',   render: fmtTime },
  { key: 'entrada_comida', label: 'Ent. Comida', render: fmtTime },
  { key: 'salida_comida',  label: 'Sal. Comida', render: fmtTime },
  { key: 'salida',   label: 'Salida',    render: fmtTime },
]

const EMPTY = { empleado_id: '', fecha: today(), entrada: '', entrada_comida: '', salida_comida: '', salida: '', observaciones: '' }

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// ── Vista de cuadrícula semanal ───────────────────────────────────────────────
function GridView({ empleados, weekDate, setWeekDate, onEdit }) {
  const days = weekDays(weekDate)
  const [rows, setRows] = useState([])

  const load = useCallback(async () => {
    const { data } = await getAsistencia({ desde: days[0], hasta: days[6], per_page: 500 })
    setRows(data.data ?? [])
  }, [days[0]]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  const getCell = (empId, date) => rows.find(r => String(r.empleado_id) === String(empId) && r.fecha === date)

  const prevWeek = () => {
    const d = new Date(days[0] + 'T00:00:00'); d.setDate(d.getDate() - 7)
    setWeekDate(d.toISOString().split('T')[0])
  }
  const nextWeek = () => {
    const d = new Date(days[0] + 'T00:00:00'); d.setDate(d.getDate() + 7)
    setWeekDate(d.toISOString().split('T')[0])
  }

  const thisWeekLabel = `${days[0]} — ${days[6]}`

  return (
    <div className="space-y-4">
      {/* Navegación de semana */}
      <div className="flex items-center gap-3">
        <button onClick={prevWeek} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">← Anterior</button>
        <span className="text-sm font-medium text-slate-700 min-w-[16rem] text-center">{thisWeekLabel}</span>
        <button onClick={nextWeek} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Siguiente →</button>
      </div>

      {/* Cuadrícula */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 min-w-[9rem]">Empleado</th>
              {days.map((d, i) => {
                const isToday = d === today()
                return (
                  <th key={d} className={`px-2 py-3 text-center font-semibold min-w-[6.5rem] ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                    <div>{DAY_LABELS[i]}</div>
                    <div className={`text-xs font-normal ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{d.slice(5)}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empleados.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">
                  {emp.apellidos} {emp.nombre}
                </td>
                {days.map(d => {
                  const cell = getCell(emp.id, d)
                  return (
                    <td key={d} className="px-1 py-1 text-center">
                      {cell ? (
                        <button
                          onClick={() => onEdit(cell)}
                          className="w-full rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors p-1.5 text-left"
                        >
                          <div className="text-emerald-700 font-semibold">{fmtTime(cell.entrada)}</div>
                          <div className="text-emerald-500">{fmtTime(cell.salida)}</div>
                        </button>
                      ) : (
                        <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 p-2 text-slate-300 text-center">
                          —
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Sin empleados</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Haz clic en una celda para editar el registro de ese día. Las celdas con fondo verde tienen registro.</p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AsistenciaPage() {
  const [view, setView]       = useState('tabla')  // 'tabla' | 'cuadricula'
  const [rows, setRows]       = useState([])
  const [meta, setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 })
  const [empleados, setEmpleados] = useState([])
  const [filters, setFilters] = useState({ empleado_id: '', desde: today(), hasta: today() })
  const [weekDate, setWeekDate] = useState(today())
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)

  const loadTable = useCallback(async (page = 1) => {
    const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
    const { data } = await getAsistencia(params)
    setRows(data.data); setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
  }, [filters])

  useEffect(() => { if (view === 'tabla') loadTable() }, [loadTable, view])
  useEffect(() => { getEmpleados({ per_page: 200 }).then(r => setEmpleados(r.data.data)) }, [])

  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setF = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))

  const openNew  = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (row) => {
    setEditing(row)
    setForm({ empleado_id: row.empleado_id, fecha: row.fecha, entrada: row.entrada ?? '', entrada_comida: row.entrada_comida ?? '', salida_comida: row.salida_comida ?? '', salida: row.salida ?? '', observaciones: row.observaciones ?? '' })
    setErrors({}); setModal(true)
  }

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateAsistencia(editing.id, form); else await registrarAsistencia(form)
      setModal(false)
      if (view === 'tabla') loadTable()
      // Forzar recarga en grid — se maneja por weekDate change
    } catch (err) { setErrors(err.response?.data?.errors ?? {}) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Toggle vista */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
          <button
            onClick={() => setView('tabla')}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${view === 'tabla' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <TableCellsIcon className="w-4 h-4" /> Tabla
          </button>
          <button
            onClick={() => setView('cuadricula')}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${view === 'cuadricula' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CalendarDaysIcon className="w-4 h-4" /> Cuadrícula
          </button>
        </div>

        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Registrar asistencia</Button>
      </div>

      {/* Vista tabla */}
      {view === 'tabla' && (
        <>
          <div className="flex gap-3 flex-wrap items-center">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={filters.empleado_id} onChange={setF('empleado_id')}>
              <option value="">Todos los empleados</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.apellidos} {e.nombre}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Desde</span>
              <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filters.desde} onChange={setF('desde')} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Hasta</span>
              <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filters.hasta} onChange={setF('hasta')} />
            </div>
            <span className="text-sm text-slate-400">{meta.total} registros</span>
          </div>
          <Table
            columns={[...TABLE_COLS, {
              key: '_e', label: '',
              render: (_, row) => <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:underline">Editar</button>
            }]}
            data={rows}
          />
        </>
      )}

      {/* Vista cuadrícula */}
      {view === 'cuadricula' && (
        <GridView empleados={empleados} weekDate={weekDate} setWeekDate={setWeekDate} onEdit={openEdit} />
      )}

      {/* Modal registro / edición */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar asistencia' : 'Registrar asistencia'}>
        <form onSubmit={submit} className="space-y-4">
          <Select label="Empleado *" value={form.empleado_id} onChange={set('empleado_id')} required placeholder="Seleccionar"
            options={empleados.map(e => ({ value: e.id, label: `${e.apellidos} ${e.nombre}` }))} error={errors.empleado_id?.[0]} />
          <Input label="Fecha *" type="date" value={form.fecha} onChange={set('fecha')} required error={errors.fecha?.[0]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Entrada"       type="time" value={form.entrada}        onChange={set('entrada')} />
            <Input label="Entrada comida" type="time" value={form.entrada_comida} onChange={set('entrada_comida')} />
            <Input label="Salida comida"  type="time" value={form.salida_comida}  onChange={set('salida_comida')} />
            <Input label="Salida"        type="time" value={form.salida}         onChange={set('salida')} />
          </div>
          <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
