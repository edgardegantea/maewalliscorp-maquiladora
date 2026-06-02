import { useEffect, useState, useCallback } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getAreas, createArea, updateArea, deleteArea } from '../../api/catalogos'
import api from '../../api/axios'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { toast } from '../../components/ui/Toast'

const COLS = [
  { key: 'nombre', label: 'Área' },
  { key: 'descripcion', label: 'Descripción', render: (v) => <span className="text-slate-500 text-xs">{v ?? '—'}</span> },
  { key: 'encargado_activo', label: 'Encargado actual', render: (_, r) => {
    const enc = r.encargado_activo
    return enc?.empleado ? `${enc.empleado.apellidos} ${enc.empleado.nombre}` : <span className="text-slate-400 text-xs">Sin encargado</span>
  }},
]
const EMPTY = { nombre: '', descripcion: '' }

export default function AreasPage() {
  const [rows, setRows] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [modal, setModal] = useState(false)
  const [encModal, setEncModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [encForm, setEncForm] = useState({ empleado_id: '', fecha_inicio: new Date().toISOString().split('T')[0] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await getAreas()
    setRows(data)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { api.get('/empleados?per_page=200').then(r => setEmpleados(r.data.data)) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '' }); setErrors({}); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateArea(editing.id, form); else await createArea(form)
      toast.success(editing ? 'Área actualizada' : 'Área creada')
      setModal(false); load()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      toast.error('Error al guardar')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar área "${r.nombre}"?`)) return
    try { await deleteArea(r.id); toast.success('Área eliminada'); load() }
    catch { toast.error('No se pudo eliminar') }
  }

  const openEncargado = (r) => { setSelectedArea(r); setEncForm({ empleado_id: '', fecha_inicio: new Date().toISOString().split('T')[0] }); setEncModal(true) }

  const submitEncargado = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/area_encargados', { area_id: selectedArea.id, ...encForm, status: 'activo' })
      toast.success('Encargado asignado')
      setEncModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al asignar') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{rows.length} áreas</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva área</Button>
      </div>
      <Table columns={[...COLS, { key: '_a', label: '', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEncargado(r) }} className="text-xs text-purple-600 hover:underline">Encargado</button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      )}]} data={rows} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar área' : 'Nueva área'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={encModal} onClose={() => setEncModal(false)} title={`Asignar encargado — ${selectedArea?.nombre}`}>
        <form onSubmit={submitEncargado} className="space-y-4">
          <Select label="Empleado *" value={encForm.empleado_id} onChange={(e) => setEncForm(f => ({...f, empleado_id: e.target.value}))} required placeholder="Seleccionar empleado"
            options={empleados.map(e => ({ value: e.id, label: `${e.apellidos} ${e.nombre}` }))} />
          <Input label="Fecha inicio *" type="date" value={encForm.fecha_inicio} onChange={(e) => setEncForm(f => ({...f, fecha_inicio: e.target.value}))} required />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEncModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Asignar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
