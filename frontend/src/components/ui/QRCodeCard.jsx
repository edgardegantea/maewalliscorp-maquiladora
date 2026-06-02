/**
 * QRCodeCard — muestra un código QR con etiqueta e info adicional.
 *
 * Props:
 *   value       string   — dato a codificar en el QR
 *   label       string   — título del badge (ej. nombre del empleado)
 *   subtitle    string   — segunda línea (ej. número de huella / código orden)
 *   extra       string   — tercera línea opcional
 *   size        number   — tamaño del QR en px (default 200)
 */
import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PrinterIcon, QrCodeIcon } from '@heroicons/react/24/outline'

export default function QRCodeCard({ value, label, subtitle, extra, size = 200 }) {
  const printRef = useRef(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const win = window.open('', '_blank', 'width=400,height=500')
    win.document.write(`
      <html>
        <head>
          <title>QR — ${label}</title>
          <style>
            body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; gap: 12px; }
            .label { font-size: 18px; font-weight: 700; color: #1e293b; text-align: center; }
            .sub   { font-size: 13px; color: #475569; text-align: center; }
            .code  { font-size: 11px; color: #94a3b8; font-family: monospace; text-align: center; margin-top: 4px; }
            svg    { display: block; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Área imprimible */}
      <div ref={printRef} className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-2 mb-1">
          <QrCodeIcon className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Maquiladora MaeWallis</span>
        </div>
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
        {label && (
          <p className="label text-lg font-bold text-slate-800 text-center">{label}</p>
        )}
        {subtitle && (
          <p className="sub text-sm text-slate-500 text-center">{subtitle}</p>
        )}
        {extra && (
          <p className="sub text-xs text-slate-400 text-center">{extra}</p>
        )}
        <p className="code text-xs text-slate-300 font-mono">{value}</p>
      </div>

      {/* Botón imprimir */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors"
      >
        <PrinterIcon className="w-4 h-4" />
        Imprimir badge
      </button>
    </div>
  )
}
