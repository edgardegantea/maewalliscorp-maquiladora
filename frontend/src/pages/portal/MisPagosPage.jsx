import { useState, useEffect } from 'react'
import { getPortalPagos } from '../../api/portal'
import {
  BanknotesIcon, CheckCircleIcon, ClockIcon,
  PrinterIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

const METODO_LABEL = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  cheque:        'Cheque',
  otro:          'Otro',
}

function ReciboPago({ pago, empleado }) {
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=480,height=640')
    win.document.write(`
      <html><head>
        <title>Recibo de pago</title>
        <style>
          body{font-family:Arial,sans-serif;padding:28px;color:#1e293b;font-size:13px}
          h2{color:#1d4ed8;margin-bottom:4px}
          .sub{color:#64748b;font-size:12px;margin-bottom:20px}
          table{width:100%;border-collapse:collapse;margin:16px 0}
          th{background:#f1f5f9;text-align:left;padding:8px;font-size:11px;font-weight:700;text-transform:uppercase}
          td{padding:7px 8px;border-bottom:1px solid #e2e8f0;font-size:12px}
          .total{font-weight:700;font-size:14px;color:#059669}
          .footer{margin-top:36px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between}
          .sign{width:45%;text-align:center}
          .sign-line{border-top:1px solid #94a3b8;margin-top:44px;padding-top:6px;font-size:11px;color:#64748b}
        </style>
      </head><body>
        <h2>Recibo de Pago de Producción</h2>
        <div class="sub">Confecciones MaeWallis S.A. de C.V.</div>
        <table>
          <tr><th>Empleado</th><td>${empleado?.apellidos ?? ''} ${empleado?.nombre ?? ''}</td></tr>
          <tr><th>Período</th><td>${pago.fecha_inicio} al ${pago.fecha_fin}</td></tr>
          <tr><th>Corte</th><td>${pago.nombre_corte}</td></tr>
          <tr><th>Hojas de producción</th><td>${pago.num_hojas}</td></tr>
          <tr><th>Subtotal producción</th><td>${fmt(pago.total_hojas)}</td></tr>
          ${pago.deducciones > 0 ? `<tr><th>Deducciones</th><td style="color:#dc2626">(${fmt(pago.deducciones)})</td></tr>` : ''}
          <tr><th>TOTAL NETO</th><td class="total">${fmt(pago.total_neto)}</td></tr>
          <tr><th>Fecha de pago</th><td>${pago.fecha_pago}</td></tr>
          <tr><th>Método</th><td>${METODO_LABEL[pago.metodo_pago] ?? pago.metodo_pago}${pago.referencia_pago ? ' · ' + pago.referencia_pago : ''}</td></tr>
        </table>
        <div class="footer">
          <div class="sign"><div class="sign-line">Recibí conforme<br>${empleado?.apellidos ?? ''} ${empleado?.nombre ?? ''}</div></div>
          <div class="sign"><div class="sign-line">Entregué<br>Encargado / Administración</div></div>
        </div>
        <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <button onClick={handlePrint}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-lg">
      <PrinterIcon className="w-3.5 h-3.5" />
      Recibo
    </button>
  )
}

export default function MisPagosPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortalPagos()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-16 text-center text-slate-400">Cargando...</div>
  if (!data)   return <div className="py-16 text-center text-slate-400">Sin datos</div>

  const { empleado, total_recibido, total_pendiente, pagos, hojas_pendientes } = data

  return (
    <div className="space-y-6 max-w-3xl">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Total recibido</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{fmt(total_recibido)}</p>
          <p className="text-xs text-emerald-500 mt-0.5">{pagos?.length ?? 0} pago(s) registrado(s)</p>
        </div>
        <div className={`rounded-xl border p-5 ${total_pendiente > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${total_pendiente > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {total_pendiente > 0 ? 'Pendiente de pago' : 'Sin pendientes'}
          </p>
          <p className={`text-3xl font-black mt-1 ${total_pendiente > 0 ? 'text-amber-700' : 'text-slate-300'}`}>{fmt(total_pendiente)}</p>
          {total_pendiente > 0 && <p className="text-xs text-amber-500 mt-0.5">{hojas_pendientes?.length ?? 0} hoja(s) sin cobrar</p>}
        </div>
      </div>

      {/* Trabajo pendiente */}
      {hojas_pendientes?.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-amber-500" />
            Trabajo pendiente de cobro
          </h3>
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  {['#', 'Período', 'Orden', 'Importe'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hojas_pendientes.map(h => (
                  <tr key={h.id}>
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">#{h.id}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{h.fecha_inicio} → {h.fecha_fin}</td>
                    <td className="px-4 py-2.5 text-slate-600">{h.orden_codigo ?? '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-amber-700">{fmt(h.total_a_pagar)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-amber-100 bg-amber-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-amber-700">Total pendiente</td>
                  <td className="px-4 py-3 font-black text-amber-700">{fmt(total_pendiente)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
          Historial de pagos recibidos
        </h3>
        {!pagos?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 py-12 text-center">
            <BanknotesIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400">Aún no tienes pagos registrados</p>
            <p className="text-slate-300 text-sm mt-1">Los pagos aparecen cuando el encargado cierra un corte de nómina</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagos.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{p.nombre_corte}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.fecha_inicio} → {p.fecha_fin}
                        <span className="mx-1">·</span>
                        {p.num_hojas} hoja{p.num_hojas !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-emerald-700">{fmt(p.total_neto)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.fecha_pago} · {METODO_LABEL[p.metodo_pago] ?? p.metodo_pago}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                  <span>Producción: <strong className="text-slate-700">{fmt(p.total_hojas)}</strong></span>
                  {p.deducciones > 0 && <span>Deducciones: <strong className="text-red-500">({fmt(p.deducciones)})</strong></span>}
                  {p.referencia_pago && <span className="font-mono">Ref: {p.referencia_pago}</span>}
                  <div className="ml-auto">
                    <ReciboPago pago={p} empleado={empleado} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
