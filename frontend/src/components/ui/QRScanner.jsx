/**
 * QRScanner — lector de QR y códigos de barras con cámara.
 *
 * Props:
 *   open     boolean        — visible o no
 *   onClose  ()=>void       — cerrar sin escanear
 *   onScan   (text)=>void   — código detectado
 *   title    string         — título del overlay
 *   hint     string         — texto de ayuda (ej. "Apunta al gafete del empleado")
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import {
  XMarkIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'

// Heroicons 24 no incluye KeyboardIcon — SVG inline
function KeyboardIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h.75m3 0h.75m3 0h.75m-9 3h.75m3 0h.75m3 0h.75m-9 3h4.5m4.5 0h.75M4.5 5.25h15A1.5 1.5 0 0121 6.75v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.25V6.75A1.5 1.5 0 014.5 5.25z" />
    </svg>
  )
}

export default function QRScanner({ open, onClose, onScan, title = 'Escanear código', hint = '' }) {
  const videoRef    = useRef(null)
  const readerRef   = useRef(null)
  const [cameras, setCameras]         = useState([])
  const [camIdx, setCamIdx]           = useState(0)
  const [error, setError]             = useState('')
  const [scanned, setScanned]         = useState('')   // último código leído
  const [manualMode, setManualMode]   = useState(false)
  const [manualText, setManualText]   = useState('')
  const [loading, setLoading]         = useState(false)

  // ── Detener cámara ────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    try { readerRef.current?.reset() } catch {}
    readerRef.current = null
  }, [])

  // ── Iniciar cámara ────────────────────────────────────────────────────────
  const startCamera = useCallback(async (idx = 0) => {
    if (!videoRef.current) return
    stopCamera()
    setError('')
    setScanned('')
    setLoading(true)

    try {
      const reader  = new BrowserMultiFormatReader()
      readerRef.current = reader

      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      if (devices.length === 0) { setError('No se encontraron cámaras disponibles.'); setLoading(false); return }
      setCameras(devices)

      // Preferir cámara trasera en móvil
      let deviceId = devices[idx]?.deviceId
      if (!deviceId) {
        const back = devices.find(d => /back|rear|environment/i.test(d.label))
        deviceId = back?.deviceId ?? devices[0].deviceId
      }

      reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText()
          setScanned(text)
          // Vibración háptica si disponible
          if (navigator.vibrate) navigator.vibrate(80)
          // Pequeña pausa visual antes de cerrar
          setTimeout(() => {
            onScan(text)
          }, 400)
        }
        if (err && !(err instanceof NotFoundException)) {
          // Errores de decodificación son normales; solo loguear errores graves
        }
      })
      setLoading(false)
    } catch (err) {
      setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.')
      setLoading(false)
    }
  }, [onScan, stopCamera])

  // Arrancar/parar según `open`
  useEffect(() => {
    if (open) {
      setManualMode(false)
      setManualText('')
      startCamera(camIdx)
    } else {
      stopCamera()
      setScanned('')
      setError('')
    }
    return stopCamera
  }, [open]) // eslint-disable-line

  // Cambiar de cámara
  const switchCamera = () => {
    const next = (camIdx + 1) % Math.max(cameras.length, 1)
    setCamIdx(next)
    startCamera(next)
  }

  const submitManual = (e) => {
    e.preventDefault()
    if (manualText.trim()) onScan(manualText.trim())
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 text-white">
          <QrCodeIcon className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {cameras.length > 1 && !manualMode && (
            <button onClick={switchCamera} className="text-slate-300 hover:text-white transition-colors" title="Cambiar cámara">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setManualMode(m => !m)} className={`transition-colors ${manualMode ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`} title="Entrada manual">
            <KeyboardIcon className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="text-slate-300 hover:text-red-400 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">

        {/* Área de cámara */}
        {!manualMode && (
          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {/* Visor (crosshair) */}
            {!scanned && !error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-56 h-56">
                  {/* Esquinas del visor */}
                  {[
                    'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                    'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                    'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                    'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                  ].map((cls, i) => (
                    <span key={i} className={`absolute w-8 h-8 border-blue-400 ${cls}`} />
                  ))}
                  {/* Línea de escaneo animada */}
                  <div className="absolute left-0 right-0 h-0.5 bg-blue-400/70 animate-scan-line" style={{ top: '50%' }} />
                </div>
              </div>
            )}

            {/* Éxito */}
            {scanned && (
              <div className="absolute inset-0 bg-emerald-500/30 flex flex-col items-center justify-center gap-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-bold text-lg">{scanned}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <VideoCameraIcon className="w-10 h-10 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
                <button onClick={() => startCamera(camIdx)} className="text-xs text-blue-400 underline">Reintentar</button>
              </div>
            )}

            {/* Cargando */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Modo manual */}
        {manualMode && (
          <div className="w-full max-w-sm">
            <p className="text-slate-400 text-sm text-center mb-4">Ingresa el código manualmente</p>
            <form onSubmit={submitManual} className="flex gap-2">
              <input
                type="text"
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                placeholder="Código..."
                autoFocus
                className="flex-1 border border-slate-600 bg-slate-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
              <button type="submit" disabled={!manualText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-colors">
                OK
              </button>
            </form>
          </div>
        )}

        {/* Hint */}
        {hint && (
          <p className="text-slate-400 text-xs text-center max-w-xs">{hint}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center shrink-0">
        <p className="text-slate-600 text-xs">
          {manualMode ? 'Modo manual activo' : 'Apunta la cámara al código QR o de barras'}
        </p>
      </div>
    </div>
  )
}
