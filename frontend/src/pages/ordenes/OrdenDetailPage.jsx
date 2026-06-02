import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getOrden, updateOrden,
  getMuestras, createMuestra, updateMuestra, deleteMuestra,
  getFichas, createFicha, updateFicha, deleteFicha,
  getHojasByOrden,
} from '../../api/ordenes'
import { getEstilos, getClientes, getTallas } from '../../api/catalogos'
import { curvaTallasApi } from '../../api/comercial'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { toast } from '../../components/ui/Toast'
import {
  ChevronLeftIcon, PlusIcon, PencilIcon, TrashIcon,
  DocumentTextIcon, ClipboardDocumentListIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const TABS = ['Detalle', 'Curva de Tallas', 'Muestras', 'Ficha técnica', 'Procesos', 'Hojas de Producción']

const MUESTRA_STATUS = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'aprobada',   label: 'Aprobada' },
  { value: 'rechazada',  label: 'Rechazada' },
]
const STATUS_CHIP = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  aprobada:   'bg-emerald-100 text-emerald-700',
  rechazada:  'bg-red-100 text-red-700',
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value ?? '—'}</p>
    </div>
  )
}

// ── Tab Detalle ───────────────────────────────────────────────────────────────
function TabDetalle({ orden, onStatusChange, onUpdated }) {
  const [saving, setSaving]     = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [clientes, setClientes] = useState([])
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    getClientes({ per_page: 100 }).then(r => setClientes(r.data.data ?? []))
  }, [])

  const cambiarStatus = async (status) => {
    setSaving(true)
    try { await onStatusChange(status); toast.success(`Orden marcada como "${status.replace('_', ' ')}"`) }
    catch { toast.error('Error al cambiar estado') }
    finally { setSaving(false) }
  }

  const openEdit = () => {
    setEditForm({
      cliente_id:       String(orden.cliente_id ?? ''),
      modelo:           orden.modelo ?? '',
      corte:            orden.corte ?? '',
      fecha_entrega:    orden.fecha_entrega ?? '',
      prioridad:        orden.prioridad ?? 'media',
      seguimiento:      orden.seguimiento ?? '',
      observaciones:    orden.observaciones ?? '',
      corte_comenzado:  orden.corte_comenzado ? '1' : '0',
    })
    setEditModal(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...editForm, corte_comenzado: editForm.corte_comenzado === '1' }
      await updateOrden(orden.id, payload)
      toast.success('Orden actualizada')
      setEditModal(false); onUpdated()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const set = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const hoy = new Date().toISOString().split('T')[0]
  const vencida = orden.fecha_entrega && orden.fecha_entrega < hoy && !['completada','cancelada'].includes(orden.status)
  const diasRestantes = orden.fecha_entrega
    ? Math.ceil((new Date(orden.fecha_entrega) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-5">
      {vencida && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 shrink-0" />
          <span>Esta orden lleva <strong>{Math.abs(diasRestantes)}</strong> día(s) de retraso.</span>
        </div>
      )}
      {!vencida && diasRestantes !== null && diasRestantes <= 5 && orden.status === 'en_proceso' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 shrink-0" />
          <span>Faltan <strong>{diasRestantes}</strong> día(s) para la entrega.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600">Datos de la orden</p>
          <button onClick={openEdit}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <PencilIcon className="w-3.5 h-3.5" /> Editar orden
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Código" value={orden.codigo} />
          <Field label="Modelo" value={orden.modelo} />
          <Field label="Cliente" value={orden.cliente?.nombre} />
          <Field label="Corte" value={orden.corte} />
          <Field label="Fecha de entrega" value={orden.fecha_entrega} />
          <Field label="Prioridad" value={<Badge value={orden.prioridad} />} />
          <Field label="Corte comenzado" value={orden.corte_comenzado ? 'Sí' : 'No'} />
          <Field label="Estado actual" value={<Badge value={orden.status} label={orden.status.replace('_',' ')} />} />
          {orden.seguimiento   && <div className="col-span-2"><Field label="Seguimiento" value={orden.seguimiento} /></div>}
          {orden.observaciones && <div className="col-span-2"><Field label="Observaciones" value={orden.observaciones} /></div>}
        </div>
      </div>

      {/* Cambio de estado */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cambiar estado</p>
        <div className="flex gap-2 flex-wrap">
          {orden.status !== 'en_proceso' && <Button size="sm" disabled={saving} onClick={() => cambiarStatus('en_proceso')}><CheckCircleIcon className="w-4 h-4" /> Iniciar proceso</Button>}
          {orden.status !== 'completada' && <Button size="sm" variant="secondary" disabled={saving} onClick={() => cambiarStatus('completada')}>Marcar completada</Button>}
          {orden.status !== 'cancelada'  && <button disabled={saving} onClick={() => cambiarStatus('cancelada')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">Cancelar orden</button>}
        </div>
      </div>

      {/* Modal editar */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar orden de producción" size="md">
        <form onSubmit={saveEdit} className="space-y-4">
          <Select label="Cliente *" value={editForm.cliente_id} onChange={set('cliente_id')} required
            placeholder="Seleccionar" options={clientes.map(c => ({ value: c.id, label: c.nombre }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Modelo" value={editForm.modelo} onChange={set('modelo')} />
            <Input label="Corte" value={editForm.corte} onChange={set('corte')} />
            <Input label="Fecha de entrega" type="date" value={editForm.fecha_entrega} onChange={set('fecha_entrega')} />
            <Select label="Prioridad" value={editForm.prioridad} onChange={set('prioridad')}
              options={[{value:'alta',label:'Alta'},{value:'media',label:'Media'},{value:'baja',label:'Baja'}]} />
            <Select label="Corte comenzado" value={editForm.corte_comenzado} onChange={set('corte_comenzado')}
              options={[{value:'0',label:'No'},{value:'1',label:'Sí'}]} />
          </div>
          <Input label="Seguimiento" value={editForm.seguimiento} onChange={set('seguimiento')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={editForm.observaciones} onChange={set('observaciones')} rows={2}
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

// ── Tab Muestras ──────────────────────────────────────────────────────────────
function TabMuestras({ ordenId, estilos }) {
  const [items, setItems]     = useState([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ nombre: '', estilo_id: '', descripcion: '', observaciones: '', status: 'pendiente' })
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    const r = await getMuestras(ordenId); setItems(r.data)
  }, [ordenId])

  useEffect(() => { load() }, [load])

  const openNew  = () => { setEditing(null); setForm({ nombre: '', estilo_id: '', descripcion: '', observaciones: '', status: 'pendiente' }); setModal(true) }
  const openEdit = (m) => { setEditing(m); setForm({ nombre: m.nombre ?? '', estilo_id: m.estilo_id ?? '', descripcion: m.descripcion ?? '', observaciones: m.observaciones ?? '', status: m.status }); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await updateMuestra(editing.id, form) : await createMuestra(ordenId, form)
      toast.success(editing ? 'Muestra actualizada' : 'Muestra agregada')
      setModal(false); load()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (m) => {
    if (!window.confirm(`¿Eliminar muestra "${m.nombre}"?`)) return
    try { await deleteMuestra(m.id); toast.success('Muestra eliminada'); load() }
    catch { toast.error('Error al eliminar') }
  }

  const counts = { pendiente: 0, aprobada: 0, rechazada: 0 }
  items.forEach(m => { counts[m.status] = (counts[m.status] ?? 0) + 1 })

  return (
    <div className="space-y-4">
      {/* Mini KPIs */}
      <div className="flex gap-3">
        {Object.entries(counts).map(([s, n]) => (
          <div key={s} className={`rounded-lg px-4 py-2 border text-sm ${STATUS_CHIP[s] ?? 'bg-slate-50 text-slate-600'} bg-opacity-30`}>
            <span className="font-bold">{n}</span> {s}
          </div>
        ))}
        <div className="ml-auto">
          <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva muestra</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          Sin muestras registradas para esta orden
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Nombre', 'Estilo', 'Descripción', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.nombre || `Muestra #${m.id}`}</td>
                  <td className="px-4 py-3 text-slate-500">{m.estilo?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm max-w-xs truncate">{m.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[m.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(m)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(m)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar muestra' : 'Nueva muestra'} size="md">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={set('nombre')} />
          <Select label="Estilo" value={form.estilo_id} onChange={set('estilo_id')}
            placeholder="Sin estilo"
            options={estilos.map(e => ({ value: e.id, label: e.nombre }))} />
          <Select label="Estado" value={form.status} onChange={set('status')} options={MUESTRA_STATUS} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={set('observaciones')} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Tab Ficha técnica ─────────────────────────────────────────────────────────
function TabFicha({ ordenId, estilos }) {
  const [items, setItems]     = useState([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ estilo_id: '', detalles: '', materiales: '', instrucciones: '', observaciones: '' })
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    const r = await getFichas(ordenId); setItems(r.data)
  }, [ordenId])

  useEffect(() => { load() }, [load])

  const openNew  = () => { setEditing(null); setForm({ estilo_id: '', detalles: '', materiales: '', instrucciones: '', observaciones: '' }); setModal(true) }
  const openEdit = (f) => { setEditing(f); setForm({ estilo_id: f.estilo_id ?? '', detalles: f.detalles ?? '', materiales: f.materiales ?? '', instrucciones: f.instrucciones ?? '', observaciones: f.observaciones ?? '' }); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await updateFicha(editing.id, form) : await createFicha(ordenId, form)
      toast.success(editing ? 'Ficha actualizada' : 'Ficha creada')
      setModal(false); load()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (f) => {
    if (!window.confirm('¿Eliminar esta ficha técnica?')) return
    try { await deleteFicha(f.id); toast.success('Ficha eliminada'); load() }
    catch { toast.error('Error al eliminar') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva ficha</Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          Sin fichas técnicas. Agrega una para definir materiales e instrucciones de producción.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(f => (
            <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-5 group hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  {f.estilo && <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{f.estilo.nombre}</p>}
                  {f.detalles && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Detalles</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{f.detalles}</p>
                    </div>
                  )}
                  {f.materiales && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-3 mb-1">Materiales</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{f.materiales}</p>
                    </div>
                  )}
                  {f.instrucciones && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-3 mb-1">Instrucciones</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{f.instrucciones}</p>
                    </div>
                  )}
                  {f.observaciones && (
                    <p className="text-xs text-slate-400 italic mt-2">{f.observaciones}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(f)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(f)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar ficha técnica' : 'Nueva ficha técnica'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Estilo" value={form.estilo_id} onChange={set('estilo_id')}
            placeholder="Sin estilo específico"
            options={estilos.map(e => ({ value: e.id, label: e.nombre }))} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Detalles del producto</label>
            <textarea value={form.detalles} onChange={set('detalles')} rows={3}
              placeholder="Especificaciones generales, medidas, acabados…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Materiales</label>
            <textarea value={form.materiales} onChange={set('materiales')} rows={3}
              placeholder="Telas, avíos, cantidades por prenda…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Instrucciones de producción</label>
            <textarea value={form.instrucciones} onChange={set('instrucciones')} rows={3}
              placeholder="Pasos, cuidados especiales, máquinas requeridas…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={set('observaciones')} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar ficha'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Tab Hojas de Producción ───────────────────────────────────────────────────
function TabHojas({ ordenId }) {
  const [hojas, setHojas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHojasByOrden(ordenId)
      .then(r => setHojas(r.data.data ?? []))
      .finally(() => setLoading(false))
  }, [ordenId])

  const totalPagar  = hojas.reduce((s, h) => s + Number(h.total_a_pagar ?? 0), 0)
  const totalPiezas = hojas.reduce((s, h) => s + (h.operaciones?.reduce((ss, o) => ss + Number(o.numero_piezas ?? 0), 0) ?? 0), 0)
  const fmt = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  if (loading) return <div className="flex justify-center py-12"><Spinner size={6} /></div>

  return (
    <div className="space-y-4">
      {/* KPIs */}
      {hojas.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Hojas</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{hojas.length}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Total a pagar</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{fmt(totalPagar)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Total piezas</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{totalPiezas.toLocaleString('es-MX')}</p>
          </div>
        </div>
      )}

      {hojas.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Sin hojas de producción registradas para esta orden.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['#', 'Empleado', 'Período', 'Registrado', 'Total a pagar', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hojas.map(h => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{h.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {h.empleado ? `${h.empleado.apellidos} ${h.empleado.nombre}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {h.fecha_inicio?.slice(0, 10)} → {h.fecha_fin?.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{h.fecha_registro?.slice(0, 10)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{fmt(h.total_a_pagar)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/hojas-produccion/${h.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</td>
                <td className="px-4 py-3 font-black text-slate-800">{fmt(totalPagar)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="text-right">
        <Link to={`/hojas-produccion?orden=${ordenId}`} className="text-sm text-blue-600 hover:underline">
          Ver todas las hojas de producción →
        </Link>
      </div>
    </div>
  )
}

// ── Tab Curva de Tallas ───────────────────────────────────────────────────────
function TabCurvaTallas({ ordenId }) {
  const [curva, setCurva]     = useState([])
  const [tallas, setTallas]   = useState([])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState({})   // tallaId → cantidad
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    const [c, t] = await Promise.all([curvaTallasApi.get(ordenId), getTallas()])
    setCurva(c.data); setTallas(t.data)
  }, [ordenId])

  useEffect(() => { load() }, [load])

  const openEdit = () => {
    const d = {}
    tallas.forEach(t => { d[t.id] = 0 })
    curva.forEach(c => { d[c.talla_id] = c.cantidad })
    setDraft(d); setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = tallas
        .filter(t => draft[t.id] > 0)
        .map(t => ({ talla_id: t.id, cantidad: Number(draft[t.id]) }))
      await curvaTallasApi.sync(ordenId, payload)
      toast.success('Curva de tallas guardada')
      setEditing(false); load()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const total = curva.reduce((s, c) => s + Number(c.cantidad), 0)
  const totalDraft = Object.values(draft).reduce((s, v) => s + Number(v || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">Distribución de piezas por talla</p>
          {!editing && total > 0 && <p className="text-xs text-slate-400 mt-0.5">Total: <strong>{total.toLocaleString('es-MX')}</strong> piezas</p>}
        </div>
        {!editing
          ? <Button onClick={openEdit}><PencilIcon className="w-4 h-4" /> {curva.length ? 'Editar' : 'Definir'} curva</Button>
          : (
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          )
        }
      </div>

      {!editing && curva.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 py-12 text-center">
          <p className="text-slate-400">Sin curva de tallas definida.</p>
          <p className="text-slate-300 text-sm mt-1">Define cuántas piezas de cada talla tiene esta orden.</p>
        </div>
      ) : !editing ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Gráfico de barras visual */}
          <div className="p-6">
            <div className="flex items-end gap-3 h-36 justify-center">
              {curva.sort((a,b) => (a.talla?.orden ?? 0) - (b.talla?.orden ?? 0)).map(c => {
                const pct = total > 0 ? (c.cantidad / total) * 100 : 0
                const maxH = 128 // px
                return (
                  <div key={c.talla_id} className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <span className="text-xs font-bold text-blue-700">{c.cantidad.toLocaleString('es-MX')}</span>
                    <div
                      className="w-10 bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(4, (pct / 100) * maxH)}px` }}
                    />
                    <span className="text-xs font-semibold text-slate-600">{c.talla?.nombre}</span>
                    <span className="text-xs text-slate-400">{pct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Tabla */}
          <table className="w-full text-sm border-t border-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Talla', 'Piezas', '% del total'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {curva.sort((a,b) => (a.talla?.orden ?? 0) - (b.talla?.orden ?? 0)).map(c => (
                <tr key={c.talla_id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{c.talla?.nombre}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{Number(c.cantidad).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-2.5 text-slate-500">{total > 0 ? ((c.cantidad/total)*100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 text-xs uppercase">Total</td>
                <td className="px-4 py-3 font-black text-slate-800">{total.toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 font-bold text-slate-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Editor */
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-4">Ingresa la cantidad de piezas para cada talla. Deja en 0 las tallas que no aplican.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tallas.map(t => (
              <div key={t.id} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 text-center">{t.nombre}</label>
                <input
                  type="number" min="0"
                  value={draft[t.id] ?? 0}
                  onChange={e => setDraft(d => ({ ...d, [t.id]: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">Total: <strong className="text-slate-800">{totalDraft.toLocaleString('es-MX')}</strong> piezas</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab Procesos ──────────────────────────────────────────────────────────────
function TabProcesos({ procesos }) {
  if (!procesos.length) return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
      Sin procesos de producción registrados.
    </div>
  )
  return (
    <div className="space-y-3">
      {procesos.map(p => (
        <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{p.nombre_proceso}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Encargado: {p.empleado ? `${p.empleado.nombre} ${p.empleado.apellidos}` : '—'}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge value={p.fase} />
            <Badge value={p.status} label={p.status.replace('_', ' ')} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OrdenDetailPage() {
  const { id } = useParams()
  const [orden, setOrden]   = useState(null)
  const [estilos, setEstilos] = useState([])
  const [tab, setTab]       = useState('Detalle')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const r = await getOrden(id); setOrden(r.data)
  }, [id])

  useEffect(() => {
    Promise.all([
      getOrden(id),
      getEstilos({ per_page: 100 }),
    ]).then(([o, e]) => {
      setOrden(o.data)
      setEstilos(e.data.data ?? e.data ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    const { data } = await updateOrden(id, { status })
    setOrden(data)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>
  if (!orden)  return <p className="text-slate-400 text-center py-10">Orden no encontrada</p>

  const hoy      = new Date().toISOString().split('T')[0]
  const vencida  = orden.fecha_entrega && orden.fecha_entrega < hoy && !['completada', 'cancelada'].includes(orden.status)

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link to="/ordenes" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800 text-lg">
            {orden.codigo}
            {orden.modelo ? ` — ${orden.modelo}` : ''}
            {vencida && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">VENCIDA</span>}
          </h2>
          <p className="text-sm text-slate-500">
            {orden.cliente?.nombre ?? '—'}
            {orden.fecha_entrega && <span className="ml-2 text-slate-400">· Entrega: {orden.fecha_entrega}</span>}
          </p>
        </div>
        <Badge value={orden.prioridad} />
        <Badge value={orden.status} label={orden.status.replace('_', ' ')} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'Detalle'              && <TabDetalle orden={orden} onStatusChange={handleStatusChange} onUpdated={reload} />}
      {tab === 'Curva de Tallas'      && <TabCurvaTallas ordenId={id} />}
      {tab === 'Muestras'             && <TabMuestras ordenId={id} estilos={estilos} />}
      {tab === 'Ficha técnica'        && <TabFicha ordenId={id} estilos={estilos} />}
      {tab === 'Procesos'             && <TabProcesos procesos={orden.procesos ?? []} />}
      {tab === 'Hojas de Producción'  && <TabHojas ordenId={id} />}
    </div>
  )
}
