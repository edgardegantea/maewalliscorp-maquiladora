import { useEffect, useState, useCallback } from 'react'
import { getLineas, createLinea, updateLinea } from '../../api/catalogos'
import { PlusIcon, PencilIcon, CheckIcon, XMarkIcon, RectangleGroupIcon } from '@heroicons/react/24/outline'
import Button from '../../components/ui/Button'

const STATUS_BADGE = {
  activo:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  inactivo: 'bg-slate-100 text-slate-500 border-slate-200',
}

const EMPTY = { codigo: '', ubicacion: '', descripcion: '', status: 'activo' }

function LineaRow({ linea, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ codigo: linea.codigo, ubicacion: linea.ubicacion ?? '', descripcion: linea.descripcion ?? '', status: linea.status })
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    try { await updateLinea(linea.id, form); setEditing(false); onSaved() }
    finally { setSaving(false) }
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  if (editing) return (
    <tr className="bg-blue-50">
      <td className="px-4 py-2"><input value={form.codigo} onChange={set('codigo')} className="border border-slate-300 rounded px-2 py-1 text-sm w-28" /></td>
      <td className="px-4 py-2"><input value={form.ubicacion} onChange={set('ubicacion')} className="border border-slate-300 rounded px-2 py-1 text-sm w-full" /></td>
      <td className="px-4 py-2"><input value={form.descripcion} onChange={set('descripcion')} className="border border-slate-300 rounded px-2 py-1 text-sm w-full" /></td>
      <td className="px-4 py-2">
        <select value={form.status} onChange={set('status')} className="border border-slate-300 rounded px-2 py-1 text-sm">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </td>
      <td className="px-4 py-2 flex gap-2">
        <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800"><CheckIcon className="w-4 h-4" /></button>
        <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
      </td>
    </tr>
  )

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-700">{linea.codigo}</td>
      <td className="px-4 py-3 text-slate-700 text-sm">{linea.ubicacion ?? '—'}</td>
      <td className="px-4 py-3 text-slate-500 text-sm">{linea.descripcion ?? '—'}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[linea.status]}`}>
          {linea.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
      </td>
    </tr>
  )
}

export default function LineasProduccionPage() {
  const [lineas, setLineas] = useState([])
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const load = useCallback(() => getLineas().then(r => setLineas(r.data)), [])
  useEffect(() => { load() }, [load])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const add = async (e) => {
    e.preventDefault()
    if (!form.codigo.trim()) { setError('Código requerido'); return }
    setSaving(true); setError('')
    try { await createLinea(form); setForm(EMPTY); load() }
    catch (err) {
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message ?? 'Error'))
    }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <RectangleGroupIcon className="w-4 h-4 text-blue-600" /> Nueva línea de producción
        </h3>
        <form onSubmit={add} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Código *</label>
            <input value={form.codigo} onChange={set('codigo')} placeholder="LP-A01"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ubicación</label>
            <input value={form.ubicacion} onChange={set('ubicacion')} placeholder="Nave A – Zona Norte"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-52" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <input value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción opcional"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-52" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={set('status')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Agregar'}</Button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Código','Ubicación','Descripción','Status',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineas.map(l => <LineaRow key={l.id} linea={l} onSaved={load} />)}
            {lineas.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Sin líneas de producción</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
