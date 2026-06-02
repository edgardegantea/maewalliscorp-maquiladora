import { useEffect, useState, useCallback } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../api/catalogos'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const COLS = [
  { key: 'nombre', label: 'Nombre / Razón social' },
  { key: 'razon_social', label: 'Razón social' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
]
const EMPTY = { nombre: '', razon_social: '', domicilio: '', telefono: '', email: '', status: 'activo' }

export default function ClientesPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 })
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (page = 1) => {
    const { data } = await getClientes({ search, page })
    setRows(data.data); setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page })
  }, [search])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ nombre: r.nombre, razon_social: r.razon_social ?? '', domicilio: r.domicilio ?? '', telefono: r.telefono ?? '', email: r.email ?? '', status: r.status }); setErrors({}); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateCliente(editing.id, form); else await createCliente(form)
      setModal(false); load()
    } catch (err) { setErrors(err.response?.data?.errors ?? {}) }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar cliente "${r.nombre}"?`)) return
    await deleteCliente(r.id); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{meta.total} clientes</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo cliente</Button>
      </div>
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Table columns={[...COLS, { key: '_a', label: '', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      )}]} data={rows} />
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar cliente' : 'Nuevo cliente'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <Input label="Razón social" value={form.razon_social} onChange={set('razon_social')} error={errors.razon_social?.[0]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} error={errors.telefono?.[0]} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email?.[0]} />
          </div>
          <Input label="Domicilio" value={form.domicilio} onChange={set('domicilio')} />
          <Select label="Status" value={form.status} onChange={set('status')} options={[{value:'activo',label:'Activo'},{value:'inactivo',label:'Inactivo'}]} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
