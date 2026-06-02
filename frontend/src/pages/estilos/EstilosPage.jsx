import { useEffect, useState, useCallback } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, ListBulletIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getEstilos, createEstilo, updateEstilo, deleteEstilo } from '../../api/catalogos'
import { bomApi } from '../../api/comercial'
import { telasApi, aviosApi } from '../../api/inventario'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { toast } from '../../components/ui/Toast'

const COLS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'descripcion', label: 'Descripción', render: (v) => <span className="text-slate-500 text-xs">{v ?? '—'}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge value={v} /> },
]
const EMPTY = { nombre: '', descripcion: '', categoria: '', status: 'activo' }
const TIPO_CHIP = {
  tela: 'bg-purple-100 text-purple-700',
  avio: 'bg-orange-100 text-orange-700',
}

// ── BOM inline row (editable) ─────────────────────────────────────────────────
function BomRow({ item, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ cantidad_por_prenda: String(item.cantidad_por_prenda), unidad: item.unidad, observaciones: item.observaciones ?? '' })
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    try { await bomApi.update(item.id, form); await onSaved(); setEditing(false); toast.success('Actualizado') }
    catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const del = async () => {
    if (!window.confirm('¿Eliminar este material del BOM?')) return
    setSaving(true)
    try { await bomApi.remove(item.id); await onDeleted(); toast.success('Eliminado') }
    catch { toast.error('Error al eliminar') }
    finally { setSaving(false) }
  }

  if (editing) return (
    <tr className="bg-blue-50/50 border-b border-blue-100">
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_CHIP[item.tipo]}`}>{item.tipo}</span>
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">{item.nombre_referencia}</td>
      <td className="px-3 py-2">
        <input type="number" value={form.cantidad_por_prenda} onChange={e => setForm(f => ({...f, cantidad_por_prenda: e.target.value}))} min="0" step="0.001"
          className="border border-slate-300 rounded px-2 py-1 text-xs w-20 text-right focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2">
        <input value={form.unidad} onChange={e => setForm(f => ({...f, unidad: e.target.value}))}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-2">
        <input value={form.observaciones} onChange={e => setForm(f => ({...f, observaciones: e.target.value}))}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
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
    <tr className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
      <td className="px-4 py-2.5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_CHIP[item.tipo]}`}>{item.tipo}</span>
      </td>
      <td className="px-4 py-2.5 font-medium text-slate-800">{item.nombre_referencia}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 font-medium">{item.cantidad_por_prenda}</td>
      <td className="px-4 py-2.5 text-slate-500 text-sm">{item.unidad}</td>
      <td className="px-4 py-2.5 text-slate-400 text-xs">{item.observaciones ?? '—'}</td>
      <td className="px-4 py-2.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-3.5 h-3.5" /></button>
          <button onClick={del} disabled={saving} className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  )
}

// ── BOM Modal ─────────────────────────────────────────────────────────────────
function BomModal({ open, onClose, estilo }) {
  const [items, setItems]   = useState([])
  const [telas, setTelas]   = useState([])
  const [avios, setAvios]   = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newForm, setNewForm] = useState({ tipo: 'tela', item_id: '', nombre_referencia: '', cantidad_por_prenda: '', unidad: 'metro', observaciones: '' })

  const load = useCallback(async () => {
    if (!estilo) return
    setLoading(true)
    try { const r = await bomApi.porEstilo(estilo.id); setItems(r.data) }
    finally { setLoading(false) }
  }, [estilo])

  useEffect(() => {
    if (!open) return
    load()
    telasApi.list({ per_page: 200, status: 'activo' }).then(r => setTelas(r.data.data ?? []))
    aviosApi.list({ per_page: 200, status: 'activo' }).then(r => setAvios(r.data.data ?? []))
  }, [open, load])

  const setN = (k) => (e) => setNewForm(f => {
    const updated = { ...f, [k]: e.target.value }
    // Auto-fill nombre_referencia and unidad when item_id changes
    if (k === 'item_id') {
      const list = updated.tipo === 'tela' ? telas : avios
      const found = list.find(x => String(x.id) === String(e.target.value))
      if (found) {
        updated.nombre_referencia = found.nombre
        updated.unidad = found.unidad ?? (updated.tipo === 'tela' ? 'metro' : 'pieza')
      }
    }
    if (k === 'tipo') { updated.item_id = ''; updated.nombre_referencia = '' }
    return updated
  })

  const saveNew = async (e) => {
    e.preventDefault()
    if (!newForm.item_id || !newForm.cantidad_por_prenda) { toast.error('Completa todos los campos'); return }
    setSaving(true)
    try {
      await bomApi.create({ estilo_id: estilo.id, ...newForm })
      toast.success('Material agregado al BOM')
      setAdding(false)
      setNewForm({ tipo: 'tela', item_id: '', nombre_referencia: '', cantidad_por_prenda: '', unidad: 'metro', observaciones: '' })
      load()
    } catch { toast.error('Error al agregar') }
    finally { setSaving(false) }
  }

  const totalTelas = items.filter(i => i.tipo === 'tela').length
  const totalAvios = items.filter(i => i.tipo === 'avio').length

  return (
    <Modal open={open} onClose={onClose} title={`BOM — ${estilo?.nombre ?? ''}`} size="xl">
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">{totalTelas} tela(s)</span>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">{totalAvios} avío(s)</span>
          <span className="text-slate-400 text-xs ml-2">Materiales por prenda unitaria</span>
          <div className="ml-auto">
            <button onClick={() => setAdding(a => !a)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
              <PlusIcon className="w-3.5 h-3.5" /> Agregar material
            </button>
          </div>
        </div>

        {/* Formulario nuevo item */}
        {adding && (
          <form onSubmit={saveNew} className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                <select value={newForm.tipo} onChange={setN('tipo')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="tela">Tela</option>
                  <option value="avio">Avío</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{newForm.tipo === 'tela' ? 'Tela' : 'Avío'} *</label>
                <select value={newForm.item_id} onChange={setN('item_id')} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  {(newForm.tipo === 'tela' ? telas : avios).map(x => (
                    <option key={x.id} value={x.id}>{x.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de referencia</label>
                <input value={newForm.nombre_referencia} onChange={setN('nombre_referencia')} placeholder="Nombre en el BOM"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad por prenda *</label>
                <input type="number" value={newForm.cantidad_por_prenda} onChange={setN('cantidad_por_prenda')} min="0" step="0.001" required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
                <input value={newForm.unidad} onChange={setN('unidad')} placeholder="metro, pieza..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
                <input value={newForm.observaciones} onChange={setN('observaciones')} placeholder="Merma, notas..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setAdding(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Agregando...' : 'Agregar'}</Button>
            </div>
          </form>
        )}

        {/* Tabla BOM */}
        {loading ? (
          <p className="text-center py-6 text-slate-400">Cargando...</p>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Tipo','Material','Cantidad/prenda','Unidad','Obs.',''].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === 'Cantidad/prenda' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <BomRow key={item.id} item={item} onSaved={load} onDeleted={load} />
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Sin materiales en el BOM. Agrega telas y avíos necesarios para confeccionar una prenda de este estilo.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-400">
          El BOM define los materiales requeridos para confeccionar <strong>una</strong> prenda de este estilo.
          Pasa el cursor sobre una fila para editarla.
        </p>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function EstilosPage() {
  const [rows, setRows]     = useState([])
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [bomEstilo, setBomEstilo] = useState(null)

  const load = useCallback(async () => {
    const { data } = await getEstilos()
    setRows(data)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew  = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '', categoria: r.categoria ?? '', status: r.status }); setErrors({}); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateEstilo(editing.id, form); else await createEstilo(form)
      toast.success(editing ? 'Estilo actualizado' : 'Estilo creado')
      setModal(false); load()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      toast.error('Error al guardar')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`¿Eliminar estilo "${r.nombre}"?`)) return
    try { await deleteEstilo(r.id); toast.success('Estilo eliminado'); load() }
    catch { toast.error('No se pudo eliminar (puede estar en uso)') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{rows.length} estilos</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo estilo</Button>
      </div>
      <Table columns={[...COLS, { key: '_a', label: '', render: (_, r) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); setBomEstilo(r) }}
            title="Lista de materiales (BOM)"
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <ListBulletIcon className="w-3.5 h-3.5" /> BOM
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      )}]} data={rows} />

      {/* Modal BOM */}
      <BomModal open={!!bomEstilo} onClose={() => setBomEstilo(null)} estilo={bomEstilo} />

      {/* Modal crear/editar estilo */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar estilo' : 'Nuevo estilo'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <Input label="Categoría" value={form.categoria} onChange={set('categoria')} error={errors.categoria?.[0]} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.descripcion} onChange={set('descripcion')} />
          </div>
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
