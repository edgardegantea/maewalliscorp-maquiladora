import { useState, useEffect, useCallback } from 'react'
import { listasApi, articulosApi } from '../../api/comercial'
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline'

const TIPOS = ['general', 'cliente', 'mayoreo', 'menudeo']

const EMPTY = {
  nombre: '', descripcion: '', tipo: 'general',
  fecha_vigencia_inicio: '', fecha_vigencia_fin: '', activa: true,
}

function fmt(n) {
  return Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function tipoBadge(tipo) {
  const map = {
    general:  'bg-slate-100 text-slate-700',
    cliente:  'bg-blue-100 text-blue-700',
    mayoreo:  'bg-violet-100 text-violet-700',
    menudeo:  'bg-green-100 text-green-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[tipo] ?? 'bg-slate-100 text-slate-600'}`}>
      {tipo}
    </span>
  )
}

/* ── Modal de precios de artículos ── */
function ArticulosModal({ lista, onClose }) {
  const [articulos, setArticulos] = useState([])
  const [items, setItems]         = useState([])   // [{ articulo_id, precio }]
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')

  useEffect(() => {
    articulosApi.list({ per_page: 200 }).then(r => {
      const rows = r.data?.data ?? r.data ?? []
      setArticulos(rows)
      // Pre-llenar precios de la lista
      listasApi.get(lista.id).then(r2 => {
        const existentes = r2.data?.articulos ?? []
        const map = {}
        existentes.forEach(a => { map[a.id] = a.pivot?.precio ?? '' })
        setItems(rows.map(a => ({ articulo_id: a.id, precio: map[a.id] ?? '' })))
      })
    })
  }, [lista.id])

  const handlePrecio = (idx, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, precio: val } : it))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const payload = items
        .filter(it => it.precio !== '' && Number(it.precio) > 0)
        .map(it => ({ articulo_id: it.articulo_id, precio: Number(it.precio) }))
      await listasApi.syncArticulos(lista.id, { articulos: payload })
      setMsg('Precios guardados.')
    } catch {
      setMsg('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            Precios — {lista.nombre}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {articulos.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">Cargando artículos…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Color / Talla</th>
                  <th className="pb-2 font-medium w-32">Precio ($)</th>
                </tr>
              </thead>
              <tbody>
                {articulos.map((a, idx) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 text-slate-500">{a.codigo_sku}</td>
                    <td className="py-2 font-medium text-slate-700">{a.nombre}</td>
                    <td className="py-2 text-slate-500">{[a.color, a.talla?.nombre].filter(Boolean).join(' / ')}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={items[idx]?.precio ?? ''}
                        onChange={e => handlePrecio(idx, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-5 border-t flex items-center justify-between gap-3">
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50">
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar precios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modal CRUD lista ── */
function ListaModal({ lista, onClose, onSaved }) {
  const [form, setForm] = useState(lista ? { ...lista } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (lista) {
        await listasApi.update(lista.id, form)
      } else {
        await listasApi.create(form)
      }
      onSaved()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            {lista ? 'Editar lista' : 'Nueva lista de precios'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              required
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.activa}
                  onChange={e => set('activa', e.target.checked)}
                  className="rounded"
                />
                Lista activa
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vigencia desde</label>
              <input
                type="date"
                value={form.fecha_vigencia_inicio ?? ''}
                onChange={e => set('fecha_vigencia_inicio', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vigencia hasta</label>
              <input
                type="date"
                value={form.fecha_vigencia_fin ?? ''}
                onChange={e => set('fecha_vigencia_fin', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : lista ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function ListasPreciosPage() {
  const [listas, setListas]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)   // 'create' | 'edit' | 'articulos'
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listasApi.list({ search })
      setListas(r.data?.data ?? r.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta lista de precios?')) return
    await listasApi.remove(id)
    load()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Listas de Precios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Precios diferenciados por tipo de cliente</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal('create') }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva lista
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar lista…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Cargando…</div>
        ) : listas.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay listas de precios.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Vigencia</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Artículos</th>
                <th className="px-4 py-3 font-medium w-32"></th>
              </tr>
            </thead>
            <tbody>
              {listas.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{l.nombre}</div>
                    {l.descripcion && (
                      <div className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{l.descripcion}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{tipoBadge(l.tipo)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.fecha_vigencia_inicio
                      ? `${l.fecha_vigencia_inicio} → ${l.fecha_vigencia_fin ?? '∞'}`
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      l.activa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {l.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{l.articulos_count ?? l.articulos?.length ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        title="Precios por artículo"
                        onClick={() => { setSelected(l); setModal('articulos') }}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      >
                        <TagIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Editar"
                        onClick={() => { setSelected(l); setModal('edit') }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <ListaModal
          lista={modal === 'edit' ? selected : null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
      {modal === 'articulos' && selected && (
        <ArticulosModal
          lista={selected}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
