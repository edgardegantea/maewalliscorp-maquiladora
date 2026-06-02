import { useState, useEffect, useCallback } from 'react'
import { telasApi, proveedoresApi } from '../../api/inventario'
import { getOrdenes } from '../../api/ordenes'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, PencilIcon, TrashIcon, SwatchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const EMPTY_TELA = { proveedor_id: '', codigo: '', nombre: '', descripcion: '', composicion: '', ancho_cm: '', unidad: 'metro', precio_unitario: '', stock_minimo: '', status: 'activo' }
const EMPTY_ROLLO = { numero_rollo: '', color: '', lote: '', metros_iniciales: '', precio_unitario: '', fecha_entrada: new Date().toISOString().split('T')[0] }

const STOCK_COLOR = {
  bajo:    'bg-red-100 text-red-700 border-red-200',
  medio:   'bg-amber-100 text-amber-700 border-amber-200',
  normal:  'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const stockLevel = (t) => {
  const s = parseFloat(t.stock_actual ?? 0), m = parseFloat(t.stock_minimo ?? 0)
  if (s <= m) return 'bajo'
  if (s <= m * 1.5) return 'medio'
  return 'normal'
}

export default function TelasPage() {
  // Listado
  const [telas, setTelas]   = useState([])
  const [meta, setMeta]     = useState({})
  const [page, setPage]     = useState(1)
  const [q, setQ]           = useState('')
  const [statusF, setStatusF] = useState('activo')

  // Proveedores y órdenes (para selects)
  const [proveedores, setProveedores] = useState([])
  const [ordenes, setOrdenes]         = useState([])

  // Modal tela
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState(EMPTY_TELA)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [errors, setErrors]     = useState({})

  // Modal rollos
  const [rollosModal, setRollosModal] = useState(null)
  const [rollos, setRollos]           = useState([])
  const [rolloForm, setRolloForm]     = useState(EMPTY_ROLLO)

  // Modal fraccionar
  const [fracModal, setFracModal] = useState(null)
  const [fracForm, setFracForm]   = useState({ metros: '', orden_produccion_id: '', observaciones: '' })

  const load = useCallback(async () => {
    const { data } = await telasApi.list({ page, q: q || undefined, status: statusF || undefined })
    setTelas(data.data); setMeta(data)
  }, [page, q, statusF])

  useEffect(() => {
    load()
    proveedoresApi.list({ status: 'activo', per_page: 100 }).then(r => setProveedores(r.data.data ?? []))
    getOrdenes({ status: 'en_proceso', per_page: 100 }).then(r => setOrdenes(r.data.data ?? []))
  }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openNew  = () => { setForm(EMPTY_TELA); setEditing(null); setErrors({}); setOpen(true) }
  const openEdit = (t) => { setForm({ ...t, proveedor_id: t.proveedor_id ?? '' }); setEditing(t.id); setErrors({}); setOpen(true) }

  const save = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      editing ? await telasApi.update(editing, form) : await telasApi.create(form)
      toast.success(editing ? 'Tela actualizada' : 'Tela creada')
      setOpen(false); load()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      toast.error(err.response?.data?.message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`¿Eliminar la tela "${t.nombre}"? Se eliminarán también sus rollos.`)) return
    try { await telasApi.remove(t.id); toast.success('Tela eliminada'); load() }
    catch { toast.error('No se pudo eliminar (puede estar en uso)') }
  }

  // Rollos
  const openRollos = async (tela) => {
    const { data } = await telasApi.rollos(tela.id)
    setRollos(data.data ?? []); setRolloForm({ ...EMPTY_ROLLO }); setRollosModal(tela)
  }

  const addRollo = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await telasApi.addRollo(rollosModal.id, rolloForm)
      toast.success('Rollo agregado')
      await openRollos(rollosModal); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al agregar rollo') }
    finally { setSaving(false) }
  }

  // Fraccionar
  const openFrac = (rollo) => { setFracModal(rollo); setFracForm({ metros: '', orden_produccion_id: '', observaciones: '' }) }

  const fraccionar = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await telasApi.fraccionar(fracModal.id, fracForm)
      toast.success('Rollo fraccionado')
      setFracModal(null)
      await openRollos(rollosModal); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al fraccionar') }
    finally { setSaving(false) }
  }

  // KPIs
  const bajosCount  = telas.filter(t => stockLevel(t) === 'bajo').length
  const valorTotal  = telas.reduce((s, t) => s + parseFloat(t.stock_actual ?? 0) * parseFloat(t.precio_unitario ?? 0), 0)
  const stockTotal  = telas.reduce((s, t) => s + parseFloat(t.stock_actual ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tipos de tela</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{meta.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Stock total</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{stockTotal.toLocaleString('es-MX', { maximumFractionDigits: 1 })} m</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Valor estimado</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {valorTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        <div className={`rounded-xl border p-4 ${bajosCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${bajosCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Stock bajo</p>
          <p className={`text-3xl font-bold mt-1 ${bajosCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{bajosCount}</p>
        </div>
      </div>

      {/* Alerta */}
      {bajosCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span><strong>{bajosCount}</strong> tela(s) con stock igual o por debajo del mínimo</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Buscar tela…" value={q}
            onChange={e => { setQ(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva tela</Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Código', 'Tela / Composición', 'Ancho', 'Stock actual', 'Mínimo', 'Proveedor', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {telas.map(t => {
              const lvl = stockLevel(t)
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.codigo || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{t.nombre}</div>
                    <div className="text-xs text-slate-400">{t.composicion}{t.composicion && t.ancho_cm ? ' · ' : ''}{t.ancho_cm ? `${t.ancho_cm} cm` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t.ancho_cm ? `${t.ancho_cm} cm` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STOCK_COLOR[lvl]}`}>
                      {parseFloat(t.stock_actual ?? 0).toFixed(2)} {t.unidad}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{parseFloat(t.stock_minimo ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{t.proveedor?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openRollos(t)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                        Rollos
                      </button>
                      <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {telas.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                <SwatchIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Sin telas registradas
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Página {meta.current_page} de {meta.last_page} — {meta.total} registros</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹ Anterior</button>
            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors">Siguiente ›</button>
          </div>
        </div>
      )}

      {/* ── Modal: Crear / Editar tela ── */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar tela' : 'Nueva tela'} size="md">
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <Input label="Código" value={form.codigo} onChange={set('codigo')} error={errors.codigo?.[0]} />
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required error={errors.nombre?.[0]} />
          <Input label="Composición" placeholder="100% algodón" value={form.composicion} onChange={set('composicion')} />
          <Input label="Ancho (cm)" type="number" step="0.1" value={form.ancho_cm} onChange={set('ancho_cm')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
            <select value={form.unidad} onChange={set('unidad')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['metro', 'yarda', 'kg', 'rollo'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <Input label="Precio / unidad" type="number" step="0.01" value={form.precio_unitario} onChange={set('precio_unitario')} />
          <Input label="Stock mínimo" type="number" step="0.01" value={form.stock_minimo} onChange={set('stock_minimo')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Proveedor</label>
            <select value={form.proveedor_id} onChange={set('proveedor_id')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin asignar</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <select value={form.status} onChange={set('status')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="col-span-2">
            <Input label="Descripción" value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Rollos ── */}
      <Modal open={!!rollosModal} onClose={() => setRollosModal(null)} title={`Rollos — ${rollosModal?.nombre ?? ''}`} size="xl">
        <div className="space-y-5">
          {/* Tabla de rollos */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {['N° Rollo', 'Color', 'Lote', 'Inicial', 'Disponible', 'Estado', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rollos.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-medium">{r.numero_rollo || `#${r.id}`}</td>
                    <td className="px-3 py-2">{r.color || '—'}</td>
                    <td className="px-3 py-2 text-slate-400">{r.lote || '—'}</td>
                    <td className="px-3 py-2">{r.metros_iniciales}</td>
                    <td className="px-3 py-2">
                      <span className={`font-bold ${parseFloat(r.metros_disponibles) <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {r.metros_disponibles}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        r.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'agotado'    ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      {r.status === 'disponible' && (
                        <button onClick={() => openFrac(r)}
                          className="text-blue-600 hover:text-blue-800 underline text-xs font-medium">
                          Fraccionar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rollos.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">Sin rollos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Formulario nuevo rollo */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Agregar nuevo rollo</p>
            <form onSubmit={addRollo} className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">N° Rollo</label>
                <input value={rolloForm.numero_rollo}
                  onChange={e => setRolloForm(f => ({ ...f, numero_rollo: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Color</label>
                <input value={rolloForm.color}
                  onChange={e => setRolloForm(f => ({ ...f, color: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Lote</label>
                <input value={rolloForm.lote}
                  onChange={e => setRolloForm(f => ({ ...f, lote: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Metros *</label>
                <input type="number" min="0" step="0.01" value={rolloForm.metros_iniciales}
                  onChange={e => setRolloForm(f => ({ ...f, metros_iniciales: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Precio/unidad</label>
                <input type="number" min="0" step="0.01" value={rolloForm.precio_unitario}
                  onChange={e => setRolloForm(f => ({ ...f, precio_unitario: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fecha entrada</label>
                <input type="date" value={rolloForm.fecha_entrada}
                  onChange={e => setRolloForm(f => ({ ...f, fecha_entrada: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-3 flex justify-end">
                <Button type="submit" disabled={saving || !rolloForm.metros_iniciales}>
                  <PlusIcon className="w-4 h-4" /> {saving ? 'Agregando…' : 'Agregar rollo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Fraccionar rollo ── */}
      <Modal open={!!fracModal} onClose={() => setFracModal(null)} title="Fraccionar rollo" size="sm">
        <form onSubmit={fraccionar} className="space-y-4">
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Rollo</span>
              <span className="font-medium">{fracModal?.numero_rollo || `#${fracModal?.id}`}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-500">Disponible</span>
              <span className="font-bold text-emerald-600">{fracModal?.metros_disponibles} m</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Metros a consumir *</label>
            <input type="number" min="0.01" step="0.01" max={fracModal?.metros_disponibles}
              value={fracForm.metros} onChange={e => setFracForm(f => ({ ...f, metros: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Orden de producción</label>
            <select value={fracForm.orden_produccion_id}
              onChange={e => setFracForm(f => ({ ...f, orden_produccion_id: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin orden específica</option>
              {ordenes.map(o => (
                <option key={o.id} value={o.id}>{o.codigo} — {o.cliente?.nombre ?? ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={fracForm.observaciones}
              onChange={e => setFracForm(f => ({ ...f, observaciones: e.target.value }))}
              rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setFracModal(null)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !fracForm.metros}>{saving ? 'Procesando…' : 'Confirmar fraccionamiento'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
