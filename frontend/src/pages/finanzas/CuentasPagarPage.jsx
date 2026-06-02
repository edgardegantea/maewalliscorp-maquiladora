import { useState, useEffect, useCallback } from 'react'
import { cuentasPagarApi } from '../../api/comercial'
import { proveedoresApi } from '../../api/inventario'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, ExclamationTriangleIcon, BanknotesIcon,
} from '@heroicons/react/24/outline'

const STATUS_CHIP = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  parcial:   'bg-blue-100 text-blue-700',
  pagado:    'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-slate-100 text-slate-500',
}
const METODOS = ['efectivo', 'transferencia', 'cheque', 'otro']
const EMPTY = { proveedor_id: '', folio: '', concepto: '', monto_total: '', fecha_emision: new Date().toISOString().slice(0, 10), fecha_vencimiento: '', metodo_pago: '', observaciones: '' }

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export default function CuentasPagarPage() {
  const [rows, setRows]         = useState([])
  const [meta, setMeta]         = useState({})
  const [page, setPage]         = useState(1)
  const [proveedores, setProveedores] = useState([])
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null)
  const [pagoModal, setPagoModal] = useState(null)
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo_pago: 'efectivo', observaciones: '' })
  const [saving, setSaving]     = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [soloVencidas, setSoloVencidas] = useState(false)

  const load = useCallback(async () => {
    const { data } = await cuentasPagarApi.list({ page, status: filtroStatus || undefined, vencidas: soloVencidas || undefined })
    setRows(data.data); setMeta(data)
  }, [page, filtroStatus, soloVencidas])

  useEffect(() => { load(); proveedoresApi.list({ status: 'activo', per_page: 100 }).then(r => setProveedores(r.data.data ?? [])) }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openNew  = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
  const openEdit = (r) => { setForm({ ...r, proveedor_id: r.proveedor_id ?? '' }); setEditing(r.id); setOpen(true) }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await cuentasPagarApi.update(editing, form) : await cuentasPagarApi.create(form)
      toast.success(editing ? 'Cuenta actualizada' : 'Cuenta creada')
      setOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  const registrarPago = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await cuentasPagarApi.registrarPago(pagoModal.id, pagoForm)
      toast.success('Pago registrado')
      setPagoModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error') }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar esta cuenta?')) return
    try { await cuentasPagarApi.remove(id); toast.success('Cuenta eliminada'); load() }
    catch { toast.error('No se pudo eliminar') }
  }

  const saldo    = (r) => Math.max(0, parseFloat(r.monto_total) - parseFloat(r.monto_pagado))
  const isVencida = (r) => r.fecha_vencimiento && r.fecha_vencimiento < new Date().toISOString().split('T')[0] && r.status !== 'pagado' && r.status !== 'cancelado'

  // KPIs
  const totalPendiente = rows.filter(r => r.status !== 'pagado' && r.status !== 'cancelado').reduce((s, r) => s + saldo(r), 0)
  const vencidasCount  = rows.filter(r => isVencida(r)).length
  const pagadoHoy      = rows.filter(r => r.status === 'pagado').reduce((s, r) => s + parseFloat(r.monto_pagado ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total cuentas</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{meta.total ?? 0}</p>
        </div>
        <div className={`rounded-xl border p-4 ${totalPendiente > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${totalPendiente > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Saldo pendiente</p>
          <p className={`text-2xl font-bold mt-1 ${totalPendiente > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{fmt(totalPendiente)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${vencidasCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${vencidasCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Vencidas</p>
          <p className={`text-3xl font-bold mt-1 ${vencidasCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{vencidasCount}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total pagado (pág.)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(pagadoHoy)}</p>
        </div>
      </div>

      {/* Alerta vencidas */}
      {vencidasCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span><strong>{vencidasCount}</strong> cuenta(s) con fecha de vencimiento superada</span>
          <button onClick={() => setSoloVencidas(true)} className="ml-auto text-xs underline hover:no-underline">
            Ver solo vencidas
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 items-center flex-wrap">
          <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPage(1) }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            {['pendiente', 'parcial', 'pagado', 'cancelado'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={soloVencidas} onChange={e => setSoloVencidas(e.target.checked)}
              className="rounded border-slate-300" />
            Solo vencidas
          </label>
          {soloVencidas && (
            <button onClick={() => setSoloVencidas(false)} className="text-xs text-slate-400 underline">
              Mostrar todas
            </button>
          )}
        </div>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nueva cuenta</Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Folio', 'Proveedor', 'Concepto', 'Total', 'Pagado', 'Saldo', 'F. Emisión', 'F. Venc.', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.id} className={`hover:bg-slate-50 transition-colors group ${isVencida(r) ? 'bg-amber-50/40' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.folio || `#${r.id}`}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.proveedor?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600 max-w-[12rem] truncate">{r.concepto}</td>
                <td className="px-4 py-3 text-slate-700">{fmt(r.monto_total)}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{fmt(r.monto_pagado)}</td>
                <td className={`px-4 py-3 font-bold ${saldo(r) > 0 ? 'text-red-600' : 'text-slate-400'}`}>{fmt(saldo(r))}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.fecha_emision ?? '—'}</td>
                <td className={`px-4 py-3 text-xs font-medium ${isVencida(r) ? 'text-amber-600' : 'text-slate-400'}`}>
                  {r.fecha_vencimiento ?? '—'}
                  {isVencida(r) && <span className="ml-1">⚠️</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[r.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {r.status !== 'pagado' && r.status !== 'cancelado' && (
                      <button onClick={() => { setPagoModal(r); setPagoForm({ monto: saldo(r).toFixed(2), metodo_pago: 'efectivo', observaciones: '' }) }}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                        Pagar
                      </button>
                    )}
                    <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => del(r.id)} className="text-xs text-red-500 hover:underline">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                <BanknotesIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Sin cuentas por pagar registradas
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Página {meta.current_page} de {meta.last_page} — {meta.total} cuentas</span>
          <div className="flex gap-1">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === meta.current_page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cuenta' : 'Nueva cuenta por pagar'} size="md">
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Proveedor *</label>
            <select value={form.proveedor_id} onChange={set('proveedor_id')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar…</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <Input label="Folio / Factura" value={form.folio} onChange={set('folio')} />
          <div className="col-span-2">
            <Input label="Concepto *" value={form.concepto} onChange={set('concepto')} required />
          </div>
          <Input label="Monto total *" type="number" step="0.01" value={form.monto_total} onChange={set('monto_total')} required />
          <Input label="Fecha emisión *" type="date" value={form.fecha_emision} onChange={set('fecha_emision')} required />
          <Input label="Fecha vencimiento" type="date" value={form.fecha_vencimiento} onChange={set('fecha_vencimiento')} />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago</label>
            <select value={form.metodo_pago} onChange={set('metodo_pago')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin especificar</option>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal pago */}
      <Modal open={!!pagoModal} onClose={() => setPagoModal(null)} title="Registrar pago" size="sm">
        <form onSubmit={registrarPago} className="space-y-4">
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Proveedor</span>
              <span className="font-medium">{pagoModal?.proveedor?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo pendiente</span>
              <span className="font-bold text-red-600">{fmt(pagoModal ? saldo(pagoModal) : 0)}</span>
            </div>
          </div>
          <Input
            label="Monto a pagar *"
            type="number" step="0.01" min="0.01"
            max={pagoModal ? saldo(pagoModal) : ''}
            value={pagoForm.monto}
            onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))}
            required
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago</label>
            <select value={pagoForm.metodo_pago}
              onChange={e => setPagoForm(f => ({ ...f, metodo_pago: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Input label="Observaciones" value={pagoForm.observaciones}
            onChange={e => setPagoForm(f => ({ ...f, observaciones: e.target.value }))} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setPagoModal(null)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !pagoForm.monto}>{saving ? 'Procesando…' : 'Registrar pago'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
