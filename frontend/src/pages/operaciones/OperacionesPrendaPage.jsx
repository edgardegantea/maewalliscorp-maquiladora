import { useEffect, useState, useCallback } from 'react'
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { getOperaciones, createOperacion, updateOperacion, deleteOperacion } from '../../api/produccion'
import { getEstilos, getClientes, getLineas } from '../../api/catalogos'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import QRCodeCard from '../../components/ui/QRCodeCard'

const COLS = [
  { key: 'nombre', label: 'Operación' },
  { key: 'estilo', label: 'Estilo', render: (v) => v?.nombre ?? '—' },
  { key: 'cliente', label: 'Cliente', render: (v) => v?.nombre ?? '—' },
  { key: 'linea_produccion', label: 'Línea', render: (v) => v?.codigo ?? '—' },
  { key: 'precio', label: 'Precio', render: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'numero_piezas', label: 'Piezas' },
]

const EMPTY = { nombre: '', descripcion: '', detalle: '', observaciones: '', precio: '', numero_piezas: '', estilo_id: '', cliente_id: '', linea_produccion_id: '', area_encargado_id: '' }

export default function OperacionesPrendaPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 })
  const [search, setSearch] = useState('')
  const [estilos, setEstilos] = useState([])
  const [clientes, setClientes] = useState([])
  const [lineas, setLineas] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [qrTarget, setQrTarget] = useState(null)

  const load = useCallback(async (page = 1) => {
    const { data } = await getOperaciones({ page })
    setRows(data.data); setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page })
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    getEstilos().then(r => setEstilos(r.data))
    getClientes({ per_page: 200 }).then(r => setClientes(r.data.data))
    getLineas().then(r => setLineas(r.data))
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '', detalle: r.detalle ?? '', observaciones: r.observaciones ?? '', precio: r.precio, numero_piezas: r.numero_piezas, estilo_id: r.estilo_id ?? '', cliente_id: r.cliente_id ?? '', linea_produccion_id: r.linea_produccion_id ?? '', area_encargado_id: r.area_encargado_id ?? '' })
    setErrors({}); setModal(true)
  }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateOperacion(editing.id, form); else await createOperacion(form)
      setModal(false); load()
    } catch (err) { setErrors(err.response?.data?.errors ?? {}) }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar operación "${r.nombre}"?`)) return
    await deleteOperacion(r.id); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{meta.total} operaciones</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva operación</Button>
      </div>
      <Table columns={[...COLS, { key: '_a', label: '', render: (_, r) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); setQrTarget(r) }}
            title="Ver QR de esta operación"
            className="text-slate-400 hover:text-purple-600 transition-colors"
          >
            <QrCodeIcon className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      )}]} data={rows} />

      {/* Modal QR operación */}
      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title="QR de la operación" size="sm">
        {qrTarget && (
          <QRCodeCard
            value={String(qrTarget.id)}
            label={qrTarget.nombre}
            subtitle={`Precio: $${Number(qrTarget.precio).toFixed(2)} por pieza`}
            extra={qrTarget.estilo?.nombre ?? qrTarget.linea_produccion?.codigo ?? ''}
            size={180}
          />
        )}
        <p className="text-xs text-slate-400 text-center mt-3">
          Escanea este QR en el formulario de Hoja de Producción para agregar la operación automáticamente.
        </p>
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar operación' : 'Nueva operación de prenda'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre de la operación *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Estilo" value={form.estilo_id} onChange={set('estilo_id')} placeholder="Sin estilo"
              options={estilos.map(e => ({ value: e.id, label: e.nombre }))} />
            <Select label="Cliente" value={form.cliente_id} onChange={set('cliente_id')} placeholder="Sin cliente"
              options={clientes.map(c => ({ value: c.id, label: c.nombre }))} />
            <Select label="Línea de producción" value={form.linea_produccion_id} onChange={set('linea_produccion_id')} placeholder="Sin línea"
              options={lineas.map(l => ({ value: l.id, label: l.codigo }))} />
            <Input label="Precio ($)" type="number" step="0.01" min="0" value={form.precio} onChange={set('precio')} error={errors.precio?.[0]} />
            <Input label="Número de piezas" type="number" min="0" value={form.numero_piezas} onChange={set('numero_piezas')} error={errors.numero_piezas?.[0]} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Detalle</label>
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.detalle} onChange={set('detalle')} />
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
