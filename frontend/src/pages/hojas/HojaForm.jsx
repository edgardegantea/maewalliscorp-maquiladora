import { useState, useEffect, useCallback } from 'react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import QRScanner from '../../components/ui/QRScanner'
import { createHoja, getOperaciones } from '../../api/produccion'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, TrashIcon, QrCodeIcon,
  CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

const today    = () => new Date().toISOString().split('T')[0]
const EMPTY_OP = { operacion_prenda_id: '', numero_piezas: '', total_por_operacion: '', fecha: today() }

// ── Mini chip que confirma qué se escaneó ────────────────────────────────────
function ScanFeedback({ found, label, onClear }) {
  if (!found) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
      <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-medium truncate max-w-[12rem]">{label}</span>
      <button type="button" onClick={onClear} className="ml-auto text-emerald-400 hover:text-emerald-700">✕</button>
    </div>
  )
}

function ScanError({ text }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
      <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

export default function HojaForm({ open, onClose, onSuccess, empleados = [], ordenes = [], defaultValues = {} }) {
  const EMPTY_FORM = {
    empleado_id: '', orden_produccion_id: '',
    fecha_inicio: today(), fecha_fin: today(),
    dias_inhabiles: '0', fecha_registro: today(), observaciones: '',
    ...defaultValues,
  }

  const [form, setForm]       = useState(EMPTY_FORM)
  const [operaciones, setOperaciones] = useState([])
  const [opRows, setOpRows]   = useState([{ ...EMPTY_OP }])
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)

  // Scanner state
  const [scanner, setScanner] = useState(null)
  const [empScan, setEmpScan]  = useState(null)
  const [ordScan, setOrdScan]  = useState(null)
  const [scanErr, setScanErr]  = useState('')

  // Resetear cuando cambian los defaultValues (nuevo click en el calendario)
  useEffect(() => {
    if (open) {
      setForm({ empleado_id: '', orden_produccion_id: '', fecha_inicio: today(), fecha_fin: today(), dias_inhabiles: '0', fecha_registro: today(), observaciones: '', ...defaultValues })
      setOpRows([{ ...EMPTY_OP }])
      setErrors({}); setEmpScan(null); setOrdScan(null); setScanErr('')
    }
  }, [open, JSON.stringify(defaultValues)]) // eslint-disable-line

  // Cuando el form ya tiene empleado_id por defaultValues, marcar el chip
  useEffect(() => {
    if (defaultValues.empleado_id && empleados.length) {
      const e = empleados.find(x => String(x.id) === String(defaultValues.empleado_id))
      if (e) setEmpScan(e)
    }
  }, [defaultValues.empleado_id, empleados.length]) // eslint-disable-line

  useEffect(() => { getOperaciones({ per_page: 200 }).then(r => setOperaciones(r.data.data)) }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Recalcular total al cambiar operacion/piezas
  const setOp = (i, k) => (e) => {
    const val = e.target.value
    setOpRows(rows => rows.map((r, idx) => {
      if (idx !== i) return r
      const updated = { ...r, [k]: val }
      if (k === 'operacion_prenda_id' || k === 'numero_piezas') {
        const op  = operaciones.find(o => String(o.id) === String(k === 'operacion_prenda_id' ? val : updated.operacion_prenda_id))
        const qty = parseFloat(k === 'numero_piezas' ? val : updated.numero_piezas) || 0
        if (op && qty > 0) updated.total_por_operacion = (parseFloat(op.precio) * qty).toFixed(2)
      }
      return updated
    }))
  }

  const addOp     = () => setOpRows(r => [...r, { ...EMPTY_OP }])
  const removeOp  = (i) => setOpRows(r => r.filter((_, idx) => idx !== i))

  // ── Manejo de escaneos ───────────────────────────────────────────────────
  const handleScan = useCallback((text) => {
    setScanErr('')
    const code = text.trim()

    if (scanner === 'empleado') {
      // Buscar por numero_huella (código del gafete)
      const found = empleados.find(e =>
        e.numero_huella === code ||
        String(e.id) === code ||
        `EMP:${e.numero_huella}` === code
      )
      if (found) {
        setForm(f => ({ ...f, empleado_id: String(found.id) }))
        setEmpScan(found)
        toast.success(`Empleado: ${found.apellidos} ${found.nombre}`)
      } else {
        setScanErr(`No se encontró empleado con código "${code}"`)
      }
    }

    if (scanner === 'orden') {
      // Buscar por codigo de orden
      const found = ordenes.find(o =>
        o.codigo === code ||
        String(o.id) === code ||
        `ORD:${o.codigo}` === code
      )
      if (found) {
        setForm(f => ({ ...f, orden_produccion_id: String(found.id) }))
        setOrdScan(found)
        toast.success(`Orden: ${found.codigo}`)
      } else {
        setScanErr(`No se encontró orden con código "${code}"`)
      }
    }

    if (scanner === 'operacion') {
      // Buscar operación por id o nombre parcial
      const found = operaciones.find(o =>
        String(o.id) === code ||
        o.nombre.toLowerCase() === code.toLowerCase() ||
        `OP:${o.id}` === code
      )
      if (found) {
        // Agregar fila con la operación ya seleccionada
        setOpRows(rows => {
          // Si la última fila está vacía, usarla; si no, agregar nueva
          const lastEmpty = rows.length > 0 && !rows[rows.length - 1].operacion_prenda_id
          if (lastEmpty) {
            return rows.map((r, i) => i === rows.length - 1 ? { ...r, operacion_prenda_id: String(found.id) } : r)
          }
          return [...rows, { ...EMPTY_OP, operacion_prenda_id: String(found.id) }]
        })
        toast.info(`Operación: ${found.nombre} ($${found.precio})`)
      } else {
        setScanErr(`No se encontró operación con código "${code}"`)
      }
    }

    setScanner(null)
  }, [scanner, empleados, ordenes, operaciones])

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      await createHoja({ ...form, operaciones: opRows })
      onSuccess()
      setForm({ empleado_id: '', orden_produccion_id: '', fecha_inicio: today(), fecha_fin: today(), dias_inhabiles: '0', fecha_registro: today(), observaciones: '' })
      setOpRows([{ ...EMPTY_OP }])
      setEmpScan(null); setOrdScan(null); setScanErr('')
    } catch (err) { setErrors(err.response?.data?.errors ?? {}) }
    finally { setSaving(false) }
  }

  const totalOps = opRows.reduce((s, r) => s + (parseFloat(r.total_por_operacion) || 0), 0)

  return (
    <>
      <Modal open={open} onClose={onClose} title="Nueva hoja de producción" size="xl">
        <form onSubmit={submit} className="space-y-5">

          {/* ── Empleado ─────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="Empleado *"
                  value={form.empleado_id}
                  onChange={e => {
                    set('empleado_id')(e)
                    setEmpScan(null)
                  }}
                  required
                  placeholder="Seleccionar"
                  options={empleados.map(e => ({ value: e.id, label: `${e.apellidos} ${e.nombre}` }))}
                  error={errors.empleado_id?.[0]}
                />
              </div>
              <button
                type="button"
                onClick={() => { setScanErr(''); setScanner('empleado') }}
                title="Escanear gafete del empleado"
                className="mb-0.5 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium shrink-0"
              >
                <QrCodeIcon className="w-4 h-4" />
                Gafete
              </button>
            </div>
            {empScan && (
              <ScanFeedback
                found={empScan}
                label={`✓ ${empScan.apellidos} ${empScan.nombre} — Huella: ${empScan.numero_huella}`}
                onClear={() => { setEmpScan(null); setForm(f => ({ ...f, empleado_id: '' })) }}
              />
            )}
          </div>

          {/* ── Orden ────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="Orden de producción *"
                  value={form.orden_produccion_id}
                  onChange={e => {
                    set('orden_produccion_id')(e)
                    setOrdScan(null)
                  }}
                  required
                  placeholder="Seleccionar"
                  options={ordenes.map(o => ({ value: o.id, label: `${o.codigo} — ${o.cliente?.nombre ?? ''}` }))}
                  error={errors.orden_produccion_id?.[0]}
                />
              </div>
              <button
                type="button"
                onClick={() => { setScanErr(''); setScanner('orden') }}
                title="Escanear código de la orden"
                className="mb-0.5 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium shrink-0"
              >
                <QrCodeIcon className="w-4 h-4" />
                Orden
              </button>
            </div>
            {ordScan && (
              <ScanFeedback
                found={ordScan}
                label={`✓ ${ordScan.codigo} — ${ordScan.cliente?.nombre ?? ''}`}
                onClear={() => { setOrdScan(null); setForm(f => ({ ...f, orden_produccion_id: '' })) }}
              />
            )}
          </div>

          {/* Error de escaneo */}
          {scanErr && <ScanError text={scanErr} />}

          {/* ── Fechas ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio *"   type="date" value={form.fecha_inicio}   onChange={set('fecha_inicio')}   required />
            <Input label="Fecha fin *"       type="date" value={form.fecha_fin}       onChange={set('fecha_fin')}       required />
            <Input label="Días inhábiles"    type="number" min="0" value={form.dias_inhabiles} onChange={set('dias_inhabiles')} />
            <Input label="Fecha de registro *" type="date" value={form.fecha_registro} onChange={set('fecha_registro')} required />
          </div>
          <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />

          {/* ── Operaciones realizadas ───────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-slate-700">Operaciones realizadas</h4>
              <div className="flex items-center gap-2">
                {/* Botón escanear operación */}
                <button
                  type="button"
                  onClick={() => { setScanErr(''); setScanner('operacion') }}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 bg-purple-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <QrCodeIcon className="w-3.5 h-3.5" />
                  Escanear operación
                </button>
                <button type="button" onClick={addOp} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <PlusIcon className="w-3.5 h-3.5" /> Agregar manual
                </button>
              </div>
            </div>

            {/* Cabecera de columnas */}
            <div className="grid grid-cols-4 gap-2 mb-1 px-1">
              <span className="text-xs text-slate-400 font-medium">Operación</span>
              <span className="text-xs text-slate-400 font-medium">Piezas</span>
              <span className="text-xs text-slate-400 font-medium">Total ($)</span>
              <span className="text-xs text-slate-400 font-medium">Fecha</span>
            </div>

            <div className="space-y-2">
              {opRows.map((op, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <select
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={op.operacion_prenda_id}
                    onChange={setOp(i, 'operacion_prenda_id')}
                  >
                    <option value="">Operación...</option>
                    {operaciones.map(o => (
                      <option key={o.id} value={o.id}>{o.nombre} — ${o.precio}</option>
                    ))}
                  </select>
                  <input
                    type="number" placeholder="Piezas" min="0"
                    className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={op.numero_piezas}
                    onChange={setOp(i, 'numero_piezas')}
                  />
                  <input
                    type="number" placeholder="Total ($)" min="0" step="0.01"
                    className={`border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${op.total_por_operacion ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300'}`}
                    value={op.total_por_operacion}
                    onChange={setOp(i, 'total_por_operacion')}
                  />
                  <div className="flex gap-1">
                    <input
                      type="date"
                      className="flex-1 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none"
                      value={op.fecha}
                      onChange={setOp(i, 'fecha')}
                    />
                    {opRows.length > 1 && (
                      <button type="button" onClick={() => removeOp(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className={`mt-2 flex items-center justify-between px-2 py-1.5 rounded-lg ${totalOps > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
              <span className="text-xs text-slate-500 font-medium">Total a pagar:</span>
              <span className={`text-sm font-bold ${totalOps > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                ${totalOps.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear hoja'}</Button>
          </div>
        </form>
      </Modal>

      {/* Scanner overlay — fuera del modal para ocupar pantalla completa */}
      <QRScanner
        open={scanner !== null}
        onClose={() => setScanner(null)}
        onScan={handleScan}
        title={
          scanner === 'empleado'  ? 'Escanear gafete del empleado' :
          scanner === 'orden'     ? 'Escanear código de orden'     :
          'Escanear operación'
        }
        hint={
          scanner === 'empleado'  ? 'Apunta al QR del gafete (número de huella)' :
          scanner === 'orden'     ? 'Apunta al código QR de la hoja de orden'    :
          'Apunta al código QR de la operación de prenda'
        }
      />
    </>
  )
}
