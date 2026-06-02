import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getCorte, calcularCorte, registrarPago,
  actualizarLinea, pagarTodos, updateCorte, getHojasEmpleado,
} from '../../api/nomina'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  ChevronLeftIcon, ArrowPathIcon, BanknotesIcon,
  CheckCircleIcon, ClockIcon, PrinterIcon, EyeIcon,
  CurrencyDollarIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
const today = () => new Date().toISOString().split('T')[0]

const METODOS = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'otro',          label: 'Otro' },
]

const STATUS_CHIP = {
  borrador: 'bg-yellow-100 text-yellow-700',
  cerrado:  'bg-blue-100 text-blue-700',
  pagado:   'bg-emerald-100 text-emerald-700',
}

// ── Recibo imprimible ─────────────────────────────────────────────────────────
function Recibo({ corte, linea, hojas, empresaNombre = 'Confecciones MaeWallis' }) {
  const printRef = useRef(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=500,height=700')
    win.document.write(`
      <html>
        <head>
          <title>Recibo — ${linea.empleado?.apellidos} ${linea.empleado?.nombre}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 32px; color: #1e293b; font-size: 13px; }
            .header { border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 20px; }
            .company { font-size: 18px; font-weight: 700; color: #1d4ed8; }
            .doc-title { font-size: 14px; font-weight: 600; color: #334155; margin-top: 4px; }
            .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 16px; }
            .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #64748b; margin-bottom: 2px; }
            .value { font-size: 13px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            .total-row td { font-weight: 700; border-top: 2px solid #cbd5e1; background: #f8fafc; }
            .deduction-row td { color: #dc2626; }
            .neto-row td { color: #059669; font-size: 15px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
            .sign-box { width: 45%; text-align: center; }
            .sign-line { border-top: 1px solid #94a3b8; margin-top: 48px; padding-top: 6px; font-size: 11px; color: #64748b; }
            .badge { display: inline-block; background: #dcfce7; color: #166534; border-radius: 9999px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${empresaNombre}</div>
            <div class="doc-title">Recibo de Pago de Producción</div>
          </div>

          <div class="grid2">
            <div>
              <div class="label">Empleado</div>
              <div class="value"><strong>${linea.empleado?.apellidos} ${linea.empleado?.nombre}</strong></div>
            </div>
            <div>
              <div class="label">No. Huella</div>
              <div class="value">${linea.empleado?.numero_huella ?? '—'}</div>
            </div>
            <div>
              <div class="label">Período</div>
              <div class="value">${corte.fecha_inicio} al ${corte.fecha_fin}</div>
            </div>
            <div>
              <div class="label">Corte</div>
              <div class="value">${corte.nombre}</div>
            </div>
            <div>
              <div class="label">Fecha de pago</div>
              <div class="value">${linea.fecha_pago ?? '—'}</div>
            </div>
            <div>
              <div class="label">Método de pago</div>
              <div class="value">${linea.metodo_pago ?? '—'}${linea.referencia_pago ? ' · ' + linea.referencia_pago : ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Período hoja</th>
                <th>Orden</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(hojas ?? []).map(h => `
                <tr>
                  <td>${h.fecha_inicio?.slice(0,10) ?? ''} → ${h.fecha_fin?.slice(0,10) ?? ''}</td>
                  <td>${h.orden?.codigo ?? '—'}</td>
                  <td style="text-align:right">${fmt(h.total_a_pagar)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Subtotal producción (${linea.num_hojas} hoja${linea.num_hojas !== 1 ? 's' : ''})</td>
                <td style="text-align:right">${fmt(linea.total_hojas)}</td>
              </tr>
              ${linea.deducciones > 0 ? `<tr class="deduction-row"><td colspan="2">Deducciones</td><td style="text-align:right">(${fmt(linea.deducciones)})</td></tr>` : ''}
              <tr class="neto-row">
                <td colspan="2"><strong>TOTAL NETO A PAGAR</strong></td>
                <td style="text-align:right"><strong>${fmt(linea.total_neto)}</strong></td>
              </tr>
            </tbody>
          </table>

          ${linea.observaciones ? `<p style="font-size:11px;color:#64748b;margin-top:8px">Observaciones: ${linea.observaciones}</p>` : ''}

          <div class="footer">
            <div class="sign-box"><div class="sign-line">Firma del empleado<br>${linea.empleado?.apellidos} ${linea.empleado?.nombre}</div></div>
            <div class="sign-box"><div class="sign-line">Autorizado por<br>Encargado / Administración</div></div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors">
      <PrinterIcon className="w-3.5 h-3.5" />
      Recibo
    </button>
  )
}

// ── Modal pago individual ────────────────────────────────────────────────────
function PagoModal({ open, onClose, linea, corteId, onSuccess }) {
  const [form, setForm] = useState({ metodo_pago: 'efectivo', referencia_pago: '', fecha_pago: today(), deducciones: '0', observaciones: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm({ metodo_pago: 'efectivo', referencia_pago: '', fecha_pago: today(), deducciones: String(linea?.deducciones ?? 0), observaciones: '' })
  }, [open, linea])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const totalNeto = Math.max(0, (linea?.total_hojas ?? 0) - parseFloat(form.deducciones || 0))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await registrarPago(corteId, linea.empleado_id, form)
      toast.success(`Pago registrado para ${linea.empleado?.apellidos} ${linea.empleado?.nombre}`)
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al registrar pago') }
    finally { setSaving(false) }
  }

  if (!linea) return null
  return (
    <Modal open={open} onClose={onClose} title={`Registrar pago — ${linea.empleado?.apellidos} ${linea.empleado?.nombre}`} size="md">
      <form onSubmit={submit} className="space-y-4">
        {/* Resumen */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Hojas en período</span><span className="font-medium">{linea.num_hojas}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Total producción</span><span className="font-semibold">{fmt(linea.total_hojas)}</span></div>
        </div>

        <Input label="Deducciones ($)" type="number" min="0" step="0.01" value={form.deducciones} onChange={set('deducciones')} />

        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-semibold text-emerald-800">Total neto a pagar</span>
          <span className="text-xl font-black text-emerald-700">{fmt(totalNeto)}</span>
        </div>

        <Input label="Fecha de pago *" type="date" value={form.fecha_pago} onChange={set('fecha_pago')} required />

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago *</label>
          <select value={form.metodo_pago} onChange={set('metodo_pago')} required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <Input label="Referencia / Folio" value={form.referencia_pago} onChange={set('referencia_pago')} placeholder="Número de transferencia, cheque..." />

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
          <textarea value={form.observaciones} onChange={set('observaciones')} rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Registrando...' : 'Confirmar pago'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal pagar todos ─────────────────────────────────────────────────────────
function PagarTodosModal({ open, onClose, pendientes, corteId, onSuccess }) {
  const [form, setForm] = useState({ metodo_pago: 'efectivo', fecha_pago: today(), referencia_pago: '' })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await pagarTodos(corteId, form)
      toast.success(`${pendientes} empleado(s) marcados como pagados`)
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error') }
    finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pagar a todos los pendientes" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Se registrará el pago para <strong>{pendientes}</strong> empleado(s) pendiente(s) con los mismos datos.</span>
        </div>
        <Input label="Fecha de pago *" type="date" value={form.fecha_pago} onChange={set('fecha_pago')} required />
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago *</label>
          <select value={form.metodo_pago} onChange={set('metodo_pago')} required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <Input label="Referencia / Folio" value={form.referencia_pago} onChange={set('referencia_pago')} />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Procesando...' : 'Confirmar pagos'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal ver hojas de un empleado ────────────────────────────────────────────
function HojasModal({ open, onClose, corteId, linea }) {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !linea) return
    setLoading(true)
    getHojasEmpleado(corteId, linea.empleado_id)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [open, corteId, linea])

  return (
    <Modal open={open} onClose={onClose} title={`Hojas del período — ${linea?.empleado?.apellidos} ${linea?.empleado?.nombre}`} size="lg">
      {loading ? <p className="text-center py-6 text-slate-400">Cargando...</p> : data && (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <div className="bg-slate-50 rounded-lg px-4 py-2">
              <p className="text-xs text-slate-500">Hojas</p>
              <p className="font-bold text-slate-800">{data.hojas.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg px-4 py-2">
              <p className="text-xs text-emerald-600">Total producción</p>
              <p className="font-bold text-emerald-700">{fmt(data.total)}</p>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {['#', 'Período', 'Orden', 'Ops.', 'Total'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.hojas.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">#{h.id}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{h.fecha_inicio?.slice(0,10)} → {h.fecha_fin?.slice(0,10)}</td>
                    <td className="px-4 py-2.5 text-slate-700">{h.orden?.codigo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{h.operaciones?.length ?? '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{fmt(h.total_a_pagar)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</td>
                  <td className="px-4 py-3 font-black text-slate-800">{fmt(data.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function CorteNominaDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [corte, setCorte]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [recalc, setRecalc]     = useState(false)
  const [pagoLinea, setPagoLinea] = useState(null)
  const [pagarTodosOpen, setPagarTodosOpen] = useState(false)
  const [hojasLinea, setHojasLinea] = useState(null)
  const [filtro, setFiltro]     = useState('')

  const load = useCallback(async () => {
    try { const r = await getCorte(id); setCorte(r.data) }
    catch { toast.error('No se pudo cargar el corte') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleRecalcular = async () => {
    setRecalc(true)
    try { const r = await calcularCorte(id); setCorte(r.data); toast.success('Corte recalculado') }
    catch (err) { toast.error(err.response?.data?.message ?? 'Error') }
    finally { setRecalc(false) }
  }

  const handleCerrar = async () => {
    if (!window.confirm('¿Cerrar este corte? Ya no se recalculará automáticamente.')) return
    try { const r = await updateCorte(id, { status: 'cerrado' }); setCorte(r.data); toast.success('Corte cerrado') }
    catch { toast.error('Error al cerrar') }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Cargando...</div>
  if (!corte)  return <div className="py-20 text-center text-slate-400">Corte no encontrado</div>

  const empleadosFiltrados = (corte.empleados ?? []).filter(l => {
    if (!filtro) return true
    const q = filtro.toLowerCase()
    return (
      l.empleado?.nombre?.toLowerCase().includes(q) ||
      l.empleado?.apellidos?.toLowerCase().includes(q) ||
      l.empleado?.numero_huella?.includes(filtro)
    )
  })

  const pendientes = (corte.empleados ?? []).filter(l => l.status === 'pendiente')

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/nomina')} className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-bold text-slate-800 text-lg">{corte.nombre}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[corte.status]}`}>
              {corte.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Período: {corte.fecha_inicio} → {corte.fecha_fin}
            {corte.creado_por && <span className="ml-2 text-slate-400">· Creado por {corte.creado_por}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {corte.status === 'borrador' && (
            <>
              <button onClick={handleRecalcular} disabled={recalc}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-40">
                <ArrowPathIcon className={`w-4 h-4 ${recalc ? 'animate-spin' : ''}`} />
                Recalcular
              </button>
              <button onClick={handleCerrar}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Cerrar corte
              </button>
            </>
          )}
          {pendientes.length > 0 && corte.status !== 'borrador' && (
            <Button onClick={() => setPagarTodosOpen(true)}>
              <CurrencyDollarIcon className="w-4 h-4" />
              Pagar todos ({pendientes.length})
            </Button>
          )}
          {pendientes.length > 0 && corte.status === 'borrador' && (
            <Button onClick={() => setPagarTodosOpen(true)}>
              <CurrencyDollarIcon className="w-4 h-4" />
              Pagar todos ({pendientes.length})
            </Button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Empleados</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{corte.num_empleados}</p>
          <p className="text-xs text-slate-400 mt-0.5">{corte.num_pagados} pagados · {corte.num_pendientes} pendientes</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total calculado</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{fmt(corte.total_calculado)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total pagado</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(corte.total_pagado)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${corte.total_pendiente > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${corte.total_pendiente > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Pendiente</p>
          <p className={`text-2xl font-bold mt-1 ${corte.total_pendiente > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{fmt(corte.total_pendiente)}</p>
        </div>
      </div>

      {/* Barra de progreso global */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-500">Progreso de pago</span>
          <span className="font-semibold text-slate-700">
            {corte.total_calculado > 0 ? Math.round((corte.total_pagado / corte.total_calculado) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${corte.total_calculado > 0 ? Math.min((corte.total_pagado / corte.total_calculado) * 100, 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Filtro de empleados */}
      <div>
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Empleado', 'Hojas', 'Producción', 'Deducciones', 'Total neto', 'Estado', 'Pago', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empleadosFiltrados.map(l => (
              <tr key={l.id} className={`hover:bg-slate-50 transition-colors group ${l.status === 'pagado' ? 'bg-emerald-50/30' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${l.status === 'pagado' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {l.empleado?.nombre?.[0]}{l.empleado?.apellidos?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{l.empleado?.apellidos} {l.empleado?.nombre}</p>
                      <p className="text-xs text-slate-400">#{l.empleado?.numero_huella}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.num_hojas}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{fmt(l.total_hojas)}</td>
                <td className="px-4 py-3 text-red-500">{l.deducciones > 0 ? `(${fmt(l.deducciones)})` : '—'}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{fmt(l.total_neto)}</td>
                <td className="px-4 py-3">
                  {l.status === 'pagado' ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Pagado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <ClockIcon className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {l.status === 'pagado' && (
                    <div>
                      <p>{l.fecha_pago}</p>
                      <p className="capitalize">{l.metodo_pago}</p>
                      {l.referencia_pago && <p className="font-mono">{l.referencia_pago}</p>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setHojasLinea(l)} title="Ver hojas"
                      className="text-slate-400 hover:text-blue-600 transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {l.status === 'pagado' ? (
                      <Recibo corte={corte} linea={l} hojas={[]} />
                    ) : (
                      <button onClick={() => setPagoLinea(l)}
                        className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                        <BanknotesIcon className="w-3.5 h-3.5" />
                        Pagar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {empleadosFiltrados.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Sin empleados en este corte</td></tr>
            )}
          </tbody>
          {(corte.empleados ?? []).length > 0 && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total del corte</td>
                <td className="px-4 py-3 font-black text-slate-800">{fmt(corte.total_calculado)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Modales */}
      <PagoModal
        open={!!pagoLinea}
        onClose={() => setPagoLinea(null)}
        linea={pagoLinea}
        corteId={id}
        onSuccess={() => { setPagoLinea(null); load() }}
      />

      <PagarTodosModal
        open={pagarTodosOpen}
        onClose={() => setPagarTodosOpen(false)}
        pendientes={pendientes.length}
        corteId={id}
        onSuccess={() => { setPagarTodosOpen(false); load() }}
      />

      <HojasModal
        open={!!hojasLinea}
        onClose={() => setHojasLinea(null)}
        corteId={id}
        linea={hojasLinea}
      />
    </div>
  )
}
