import { useState, useEffect, useCallback } from 'react'
import { proveedoresApi } from '../../api/inventario'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, PencilIcon, TrashIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

const EMPTY = { nombre: '', razon_social: '', rfc: '', telefono: '', email: '', contacto: '', domicilio: '', observaciones: '', status: 'activo' }

const STATUS_CHIP = { activo: 'bg-emerald-100 text-emerald-700', inactivo: 'bg-slate-100 text-slate-500' }

// ── Fila con expansión ────────────────────────────────────────────────────────
function ProveedorRow({ row, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail]     = useState(null)

  const loadDetail = async () => {
    if (!expanded) {
      try { const r = await proveedoresApi.get(row.id); setDetail(r.data) }
      catch { setDetail({ telas: [], avios: [] }) }
    }
    setExpanded(v => !v)
  }

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors group">
        <td className="px-4 py-3">
          <div className="font-medium text-slate-800">{row.nombre}</div>
          {row.razon_social && <div className="text-xs text-slate-400">{row.razon_social}</div>}
        </td>
        <td className="px-4 py-3 text-slate-500 text-sm">{row.rfc || '—'}</td>
        <td className="px-4 py-3">
          {row.telefono && <div className="flex items-center gap-1 text-sm text-slate-600"><PhoneIcon className="w-3.5 h-3.5 text-slate-400" />{row.telefono}</div>}
          {row.email    && <div className="flex items-center gap-1 text-sm text-slate-500"><EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />{row.email}</div>}
        </td>
        <td className="px-4 py-3 text-sm text-slate-500">{row.contacto || '—'}</td>
        <td className="px-4 py-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[row.status] ?? STATUS_CHIP.activo}`}>{row.status}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 justify-end">
            <button onClick={loadDetail} title="Ver materiales"
              className="text-slate-400 hover:text-blue-600 transition-colors">
              {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            <button onClick={() => onEdit(row)} className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><PencilIcon className="w-4 h-4" /></button>
            <button onClick={() => onDelete(row)} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><TrashIcon className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>

      {/* Panel expandido */}
      {expanded && detail && (
        <tr className="bg-slate-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Telas */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Telas ({detail.telas?.length ?? 0})
                </p>
                {detail.telas?.length ? (
                  <div className="space-y-1">
                    {detail.telas.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-1.5 border border-slate-200">
                        <span className="font-medium text-slate-700">{t.nombre}</span>
                        <span className="text-slate-400">{parseFloat(t.stock_actual ?? 0).toFixed(1)} {t.unidad}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400 italic">Sin telas vinculadas</p>}
              </div>
              {/* Avíos */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Avíos ({detail.avios?.length ?? 0})
                </p>
                {detail.avios?.length ? (
                  <div className="space-y-1">
                    {detail.avios.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-1.5 border border-slate-200">
                        <span className="font-medium text-slate-700">{a.nombre}</span>
                        <span className="text-slate-400">{parseFloat(a.stock_actual ?? 0).toFixed(1)} {a.unidad}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400 italic">Sin avíos vinculados</p>}
              </div>
              {/* Domicilio */}
              {row.domicilio && (
                <div className="col-span-2 flex items-start gap-2 text-sm text-slate-500">
                  <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                  {row.domicilio}
                </div>
              )}
              {row.observaciones && (
                <div className="col-span-2 text-xs text-slate-400 italic">{row.observaciones}</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function ProveedoresPage() {
  const [rows, setRows]     = useState([])
  const [meta, setMeta]     = useState({})
  const [page, setPage]     = useState(1)
  const [q, setQ]           = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    const { data } = await proveedoresApi.list({ page, q: q || undefined, status: status || undefined })
    setRows(data.data); setMeta(data)
  }, [page, q, status])

  useEffect(() => { load() }, [load])

  const openNew  = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
  const openEdit = (r) => { setForm({ ...r }); setEditing(r.id); setOpen(true) }
  const close    = () => setOpen(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await proveedoresApi.update(editing, form) : await proveedoresApi.create(form)
      toast.success(editing ? 'Proveedor actualizado' : 'Proveedor creado')
      close(); load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`¿Eliminar al proveedor "${r.nombre}"?`)) return
    try { await proveedoresApi.remove(r.id); toast.success('Proveedor eliminado'); load() }
    catch { toast.error('No se pudo eliminar (puede tener materiales asociados)') }
  }

  // Conteos
  const totalActivos   = rows.filter(r => r.status === 'activo').length
  const totalInactivos = rows.filter(r => r.status === 'inactivo').length

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total proveedores</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{meta.total ?? 0}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Activos</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{totalActivos}</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Inactivos</p>
          <p className="text-3xl font-bold text-slate-500 mt-1">{totalInactivos}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre…"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
              className="border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo proveedor</Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Proveedor', 'RFC', 'Contacto / Email', 'Responsable', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <ProveedorRow key={r.id} row={r} onEdit={openEdit} onDelete={handleDelete} />
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                <TruckIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Sin proveedores registrados
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

      {/* Modal */}
      <Modal open={open} onClose={close} title={editing ? 'Editar proveedor' : 'Nuevo proveedor'} size="md">
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre *" value={form.nombre} onChange={set('nombre')} required />
          </div>
          <Input label="Razón Social" value={form.razon_social} onChange={set('razon_social')} />
          <Input label="RFC" value={form.rfc} onChange={set('rfc')} />
          <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} />
          <Input label="Persona de contacto" value={form.contacto} onChange={set('contacto')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <select value={form.status} onChange={set('status')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="col-span-2">
            <Input label="Domicilio" value={form.domicilio} onChange={set('domicilio')} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={set('observaciones')} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={close}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
