import { useState, useEffect, useCallback } from 'react'
import { aviosApi, proveedoresApi } from '../../api/inventario'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, PencilIcon, TrashIcon,
  ExclamationTriangleIcon, CubeIcon,
} from '@heroicons/react/24/outline'

const CATS = ['hilo','cierre','boton','etiqueta','bolsa','cinta','elastico','entretela','remache','broche','accesorio','empaque','otro']
const CAT_COLOR = {
  hilo: 'bg-pink-100 text-pink-700', cierre: 'bg-purple-100 text-purple-700',
  boton: 'bg-blue-100 text-blue-700', etiqueta: 'bg-cyan-100 text-cyan-700',
  bolsa: 'bg-teal-100 text-teal-700', cinta: 'bg-yellow-100 text-yellow-700',
  elastico: 'bg-orange-100 text-orange-700', entretela: 'bg-indigo-100 text-indigo-700',
  remache: 'bg-slate-100 text-slate-600', broche: 'bg-violet-100 text-violet-700',
  accesorio: 'bg-sky-100 text-sky-700', empaque: 'bg-lime-100 text-lime-700',
  otro: 'bg-slate-100 text-slate-500',
}

const EMPTY = { proveedor_id: '', codigo: '', nombre: '', descripcion: '', categoria: 'otro', unidad: 'pieza', precio_unitario: '', stock_actual: '', stock_minimo: '', status: 'activo' }

// Mini barra de stock
function StockBar({ actual, minimo }) {
  const pct = minimo > 0 ? Math.min((actual / minimo) * 100, 200) : 100
  const color = actual <= 0 ? 'bg-red-500' : actual <= minimo ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold ${actual <= minimo ? 'text-red-600' : 'text-emerald-600'}`}>
          {parseFloat(actual).toFixed(2)}
        </span>
        {actual <= minimo && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />}
      </div>
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct / 2, 100)}%` }} />
      </div>
    </div>
  )
}

export default function AviosPage() {
  const [rows, setRows]         = useState([])
  const [meta, setMeta]         = useState({})
  const [page, setPage]         = useState(1)
  const [proveedores, setProveedores] = useState([])
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null)
  const [stockModal, setStockModal] = useState(null)
  const [stockForm, setStockForm]   = useState({ tipo_movimiento: 'entrada', cantidad: '', observaciones: '' })
  const [saving, setSaving]     = useState(false)
  const [filtro, setFiltro]     = useState('')
  const [catFiltro, setCatFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('activo')
  const [stockBajo, setStockBajo] = useState(false)

  const load = useCallback(async () => {
    const { data } = await aviosApi.list({
      page,
      q:         filtro     || undefined,
      categoria: catFiltro  || undefined,
      status:    statusFiltro || undefined,
      stock_bajo: stockBajo || undefined,
    })
    setRows(data.data); setMeta(data)
  }, [page, filtro, catFiltro, statusFiltro, stockBajo])

  useEffect(() => { load(); proveedoresApi.list({ status: 'activo', per_page: 100 }).then(r => setProveedores(r.data.data ?? [])) }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await aviosApi.update(editing, form) : await aviosApi.create(form)
      toast.success(editing ? 'Avío actualizado' : 'Avío creado')
      setOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  const ajustar = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await aviosApi.ajustarStock(stockModal.id, stockForm)
      toast.success('Stock actualizado')
      setStockModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al ajustar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`¿Eliminar el avío "${r.nombre}"?`)) return
    try { await aviosApi.remove(r.id); toast.success('Avío eliminado'); load() }
    catch { toast.error('No se pudo eliminar') }
  }

  const openNew  = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
  const openEdit = (r) => { setForm({ ...r, proveedor_id: r.proveedor_id ?? '' }); setEditing(r.id); setOpen(true) }
  const openStock = (r) => { setStockModal(r); setStockForm({ tipo_movimiento: 'entrada', cantidad: '', observaciones: '' }) }

  // KPIs
  const totalActivos  = meta.total ?? 0
  const stockBajoCount = rows.filter(r => parseFloat(r.stock_actual) <= parseFloat(r.stock_minimo)).length
  const valorTotal    = rows.reduce((s, r) => s + parseFloat(r.stock_actual ?? 0) * parseFloat(r.precio_unitario ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total avíos</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalActivos}</p>
        </div>
        <div className={`rounded-xl border p-4 ${stockBajoCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${stockBajoCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Stock bajo</p>
          <p className={`text-3xl font-bold mt-1 ${stockBajoCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{stockBajoCount}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Valor en stock</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {valorTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Página</p>
          <p className="text-3xl font-bold text-slate-700 mt-1">{rows.length}</p>
          <p className="text-xs text-slate-400">de {totalActivos} total</p>
        </div>
      </div>

      {/* Alerta stock bajo */}
      {stockBajoCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span><strong>{stockBajoCount}</strong> avío(s) con stock por debajo del mínimo</span>
          <button onClick={() => setStockBajo(true)} className="ml-auto text-xs underline hover:no-underline">
            Ver solo estos
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Buscar…" value={filtro}
            onChange={e => { setFiltro(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
          <select value={catFiltro} onChange={e => { setCatFiltro(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas las categorías</option>
            {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select value={statusFiltro} onChange={e => { setStatusFiltro(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={stockBajo} onChange={e => setStockBajo(e.target.checked)}
              className="rounded border-slate-300" />
            Solo stock bajo
          </label>
        </div>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo avío</Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Código', 'Nombre', 'Categoría', 'Unidad / Precio', 'Stock', 'Mínimo', 'Proveedor', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.codigo || '—'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{r.nombre}</div>
                  {r.descripcion && <div className="text-xs text-slate-400 truncate max-w-[10rem]">{r.descripcion}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CAT_COLOR[r.categoria] ?? CAT_COLOR.otro}`}>
                    {r.categoria}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-600">{r.unidad}</div>
                  <div className="text-xs text-slate-400">
                    {parseFloat(r.precio_unitario ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StockBar actual={parseFloat(r.stock_actual ?? 0)} minimo={parseFloat(r.stock_minimo ?? 0)} />
                </td>
                <td className="px-4 py-3 text-slate-400 text-sm">{parseFloat(r.stock_minimo ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500 text-sm">{r.proveedor?.nombre ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openStock(r)} title="Ajustar stock"
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                      Stock
                    </button>
                    <button onClick={() => openEdit(r)} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                <CubeIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Sin avíos registrados
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

      {/* Modal avío */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar avío' : 'Nuevo avío'} size="md">
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <Input label="Código" value={form.codigo} onChange={set('codigo')} />
          <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
            <select value={form.categoria} onChange={set('categoria')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
              {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <Input label="Unidad" value={form.unidad} onChange={set('unidad')} placeholder="pieza, metro, rollo…" />
          <Input label="Precio unitario" type="number" step="0.01" value={form.precio_unitario} onChange={set('precio_unitario')} />
          <Input label="Stock mínimo" type="number" step="0.01" value={form.stock_minimo} onChange={set('stock_minimo')} />
          {!editing && <Input label="Stock inicial" type="number" step="0.01" value={form.stock_actual} onChange={set('stock_actual')} />}
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

      {/* Modal ajuste de stock */}
      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`Ajustar stock — ${stockModal?.nombre ?? ''}`} size="sm">
        <form onSubmit={ajustar} className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
            <CubeIcon className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Stock actual</p>
              <p className="font-bold text-slate-800">{parseFloat(stockModal?.stock_actual ?? 0).toFixed(2)} <span className="text-slate-400 font-normal text-sm">{stockModal?.unidad}</span></p>
            </div>
            <div className="ml-auto">
              <p className="text-xs text-slate-500">Mínimo</p>
              <p className="font-semibold text-slate-600">{parseFloat(stockModal?.stock_minimo ?? 0).toFixed(2)}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de movimiento</label>
            <select value={stockForm.tipo_movimiento}
              onChange={e => setStockForm(f => ({ ...f, tipo_movimiento: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="entrada">Entrada (compra / recepción)</option>
              <option value="salida">Salida (consumo / producción)</option>
              <option value="ajuste">Ajuste de inventario (nuevo total)</option>
              <option value="devolucion">Devolución</option>
            </select>
          </div>
          <Input
            label={stockForm.tipo_movimiento === 'ajuste' ? 'Nuevo stock total *' : 'Cantidad *'}
            type="number" min="0" step="0.01"
            value={stockForm.cantidad}
            onChange={e => setStockForm(f => ({ ...f, cantidad: e.target.value }))}
            required
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={stockForm.observaciones}
              onChange={e => setStockForm(f => ({ ...f, observaciones: e.target.value }))}
              rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setStockModal(null)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !stockForm.cantidad}>{saving ? 'Aplicando…' : 'Aplicar movimiento'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
