import { useEffect, useState, useCallback } from 'react'
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../../api/empleados'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { toast } from '../../components/ui/Toast'
import QRCodeCard from '../../components/ui/QRCodeCard'

const COLS = [
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'numero_huella', label: 'No. Huella' },
  { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
]

const EMPTY = { nombre: '', apellidos: '', telefono: '', email: '', domicilio: '', numero_huella: '', status: 'activo' }

export default function EmpleadosPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [qrTarget, setQrTarget] = useState(null) // empleado para mostrar QR

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await getEmpleados({ search, status, page })
      setRows(data.data); setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ nombre: row.nombre, apellidos: row.apellidos, telefono: row.telefono ?? '', email: row.email ?? '', domicilio: row.domicilio ?? '', numero_huella: row.numero_huella ?? '', status: row.status }); setErrors({}); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateEmpleado(editing.id, form); else await createEmpleado(form)
      toast.success(editing ? 'Empleado actualizado' : 'Empleado creado')
      setModal(false); load()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      toast.error('Error al guardar')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async (row) => {
    if (!confirm(`¿Eliminar a ${row.nombre} ${row.apellidos}?`)) return
    try { await deleteEmpleado(row.id); toast.success('Empleado eliminado'); load() }
    catch { toast.error('No se pudo eliminar') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{meta.total} empleados</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo empleado</Button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Buscar nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option>
        </select>
      </div>
      <Table columns={[...COLS,
        { key: '_actions', label: '', render: (_, row) => (
          <div className="flex gap-2 items-center">
            <button
              onClick={(e) => { e.stopPropagation(); setQrTarget(row) }}
              title="Ver / imprimir gafete QR"
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              <QrCodeIcon className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); openEdit(row) }} className="text-xs text-blue-600 hover:underline">Editar</button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(row) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
          </div>
        )}
      ]} data={rows} />

      {/* Modal gafete QR del empleado */}
      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title="Gafete del empleado" size="sm">
        {qrTarget && (
          <QRCodeCard
            value={qrTarget.numero_huella ?? String(qrTarget.id)}
            label={`${qrTarget.apellidos} ${qrTarget.nombre}`}
            subtitle={`No. Huella: ${qrTarget.numero_huella ?? '—'}`}
            extra={`ID: ${qrTarget.id} · ${qrTarget.status}`}
            size={200}
          />
        )}
        <p className="text-xs text-slate-400 text-center mt-3">
          Escanea este QR en el formulario de Hoja de Producción para seleccionar al empleado automáticamente.
        </p>
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar empleado' : 'Nuevo empleado'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
            <Input label="Apellidos *" value={form.apellidos} onChange={set('apellidos')} required error={errors.apellidos?.[0]} />
            <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} error={errors.telefono?.[0]} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email?.[0]} />
            <Input label="No. Huella" value={form.numero_huella} onChange={set('numero_huella')} error={errors.numero_huella?.[0]} />
            <Select label="Status" value={form.status} onChange={set('status')} options={[{value:'activo',label:'Activo'},{value:'inactivo',label:'Inactivo'}]} />
          </div>
          <Input label="Domicilio" value={form.domicilio} onChange={set('domicilio')} error={errors.domicilio?.[0]} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
