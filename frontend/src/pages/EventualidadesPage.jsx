import { useEffect, useState, useCallback } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getEventualidades, createEventualidad, updateEventualidad, deleteEventualidad } from '../api/catalogos'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const COLS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'fecha_hora_inicio', label: 'Inicio', render: (v) => v ? new Date(v).toLocaleString('es-MX') : '—' },
  { key: 'fecha_hora_fin', label: 'Fin', render: (v) => v ? new Date(v).toLocaleString('es-MX') : '—' },
  { key: 'observaciones', label: 'Observaciones', render: (v) => <span className="text-xs text-slate-500">{v ?? '—'}</span> },
]
const EMPTY = { nombre: '', descripcion: '', fecha_hora_inicio: '', fecha_hora_fin: '', observaciones: '' }

export default function EventualidadesPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 })
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (page = 1) => {
    const { data } = await getEventualidades({ page })
    setRows(data.data); setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page })
  }, [])

  useEffect(() => { load() }, [load])

  const toDatetimeLocal = (s) => s ? s.replace(' ', 'T').slice(0, 16) : ''
  const fromDatetimeLocal = (s) => s ? s.replace('T', ' ') + ':00' : ''

  const openNew = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '', fecha_hora_inicio: toDatetimeLocal(r.fecha_hora_inicio), fecha_hora_fin: toDatetimeLocal(r.fecha_hora_fin), observaciones: r.observaciones ?? '' })
    setErrors({}); setModal(true)
  }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    const payload = { ...form, fecha_hora_inicio: fromDatetimeLocal(form.fecha_hora_inicio), fecha_hora_fin: fromDatetimeLocal(form.fecha_hora_fin) }
    try {
      if (editing) await updateEventualidad(editing.id, payload); else await createEventualidad(payload)
      setModal(false); load()
    } catch (err) { setErrors(err.response?.data?.errors ?? {}) }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar "${r.nombre}"?`)) return
    await deleteEventualidad(r.id); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{meta.total} eventualidades</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva eventualidad</Button>
      </div>
      <Table columns={[...COLS, { key: '_a', label: '', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      )}]} data={rows} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar eventualidad' : 'Nueva eventualidad'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Inicio" type="datetime-local" value={form.fecha_hora_inicio} onChange={set('fecha_hora_inicio')} />
            <Input label="Fin" type="datetime-local" value={form.fecha_hora_fin} onChange={set('fecha_hora_fin')} />
          </div>
          <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
