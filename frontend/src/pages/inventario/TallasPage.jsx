import { useEffect, useState } from 'react'
import { getTallas, createTalla, updateTalla, deleteTalla } from '../../api/catalogos'
import { PlusIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'

function TallaRow({ talla, onSaved, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ nombre: talla.nombre, descripcion: talla.descripcion ?? '', orden: talla.orden ?? 0 })
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await updateTalla(talla.id, form)
      toast.success('Talla actualizada')
      setEditing(false); onSaved()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  if (editing) return (
    <tr className="bg-blue-50">
      <td className="px-4 py-2">
        <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          className="border border-slate-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>
      <td className="px-4 py-2">
        <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          className="border border-slate-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>
      <td className="px-4 py-2">
        <input type="number" value={form.orden} onChange={e => setForm(f => ({ ...f, orden: +e.target.value }))}
          className="border border-slate-300 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40"><CheckIcon className="w-4 h-4" /></button>
          <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  )

  return (
    <tr className="hover:bg-slate-50 group">
      <td className="px-4 py-3 font-semibold text-slate-800">{talla.nombre}</td>
      <td className="px-4 py-3 text-slate-500 text-sm">{talla.descripcion ?? '—'}</td>
      <td className="px-4 py-3 text-slate-400 text-sm">{talla.orden}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
          <button onClick={() => onDelete(talla)} className="text-slate-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  )
}

export default function TallasPage() {
  const [tallas, setTallas] = useState([])
  const [form, setForm]     = useState({ nombre: '', descripcion: '', orden: 0 })
  const [saving, setSaving] = useState(false)

  const load = () => getTallas().then(r => setTallas(r.data))
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      await createTalla(form)
      toast.success('Talla agregada')
      setForm({ nombre: '', descripcion: '', orden: 0 })
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`¿Eliminar la talla "${t.nombre}"?`)) return
    try {
      await deleteTalla(t.id)
      toast.success('Talla eliminada')
      load()
    } catch { toast.error('No se puede eliminar (puede estar en uso)') }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total tallas</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{tallas.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Rango</p>
          <p className="text-sm font-semibold text-slate-700 mt-2">
            {tallas.length ? `${tallas[0]?.nombre} → ${tallas[tallas.length - 1]?.nombre}` : '—'}
          </p>
        </div>
      </div>

      {/* Formulario nueva talla */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusIcon className="w-4 h-4 text-blue-600" /> Agregar talla
        </h3>
        <form onSubmit={add} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="XS, S, M, L, XL…"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción breve"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Orden</label>
            <input type="number" value={form.orden} onChange={e => setForm(f => ({ ...f, orden: +e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Agregar'}</Button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Talla', 'Descripción', 'Orden', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tallas.map(t => <TallaRow key={t.id} talla={t} onSaved={load} onDelete={handleDelete} />)}
            {tallas.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Sin tallas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Las tallas vinculadas a órdenes no pueden eliminarse.</p>
    </div>
  )
}
