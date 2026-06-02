import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCortes, createCorte, deleteCorte } from '../../api/nomina'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { toast } from '../../components/ui/Toast'
import {
  PlusIcon, TrashIcon, BanknotesIcon,
  CheckCircleIcon, ClockIcon, PencilSquareIcon,
} from '@heroicons/react/24/outline'

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
const today = () => new Date().toISOString().split('T')[0]

const STATUS_CHIP = {
  borrador: 'bg-yellow-100 text-yellow-700',
  cerrado:  'bg-blue-100 text-blue-700',
  pagado:   'bg-emerald-100 text-emerald-700',
}
const STATUS_ICON = {
  borrador: PencilSquareIcon,
  cerrado:  ClockIcon,
  pagado:   CheckCircleIcon,
}
const STATUS_LABEL = { borrador: 'Borrador', cerrado: 'Cerrado', pagado: 'Pagado' }

// Sugerencias de nombre para la quincena actual
function sugerirNombre() {
  const hoy = new Date()
  const mes  = hoy.toLocaleDateString('es-MX', { month: 'long' })
  const anio = hoy.getFullYear()
  const day  = hoy.getDate()
  const q    = day <= 15 ? '1ª Quincena' : '2ª Quincena'
  return `${q} — ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`
}

function quincenaActual() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes  = hoy.getMonth() + 1
  const mesPad = String(mes).padStart(2, '0')
  if (hoy.getDate() <= 15) return { desde: `${anio}-${mesPad}-01`, hasta: `${anio}-${mesPad}-15` }
  const ultimo = new Date(anio, mes, 0).getDate()
  return { desde: `${anio}-${mesPad}-16`, hasta: `${anio}-${mesPad}-${ultimo}` }
}

export default function NominaPage() {
  const [cortes, setCortes]   = useState([])
  const [meta, setMeta]       = useState({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const q = quincenaActual()
  const [form, setForm] = useState({ nombre: sugerirNombre(), fecha_inicio: q.desde, fecha_fin: q.hasta, observaciones: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getCortes(); setCortes(r.data.data); setMeta(r.data) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createCorte(form)
      toast.success('Corte de nómina creado y calculado')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Error al crear') }
    finally { setSaving(false) }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Eliminar el corte "${c.nombre}"?`)) return
    try { await deleteCorte(c.id); toast.success('Corte eliminado'); load() }
    catch { toast.error('Solo se pueden eliminar cortes en borrador') }
  }

  // KPIs
  const totalPagado    = cortes.filter(c => c.status === 'pagado').reduce((s, c) => s + c.total_pagado, 0)
  const totalPendiente = cortes.filter(c => c.status !== 'pagado').reduce((s, c) => s + (c.total_calculado - c.total_pagado), 0)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total cortes</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{meta.total ?? cortes.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total pagado</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(totalPagado)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${totalPendiente > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${totalPendiente > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Por pagar</p>
          <p className={`text-2xl font-bold mt-1 ${totalPendiente > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{fmt(totalPendiente)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{cortes.length} corte(s) de nómina</p>
        <Button onClick={() => setModal(true)}>
          <PlusIcon className="w-4 h-4" /> Nuevo corte
        </Button>
      </div>

      {/* Lista de cortes */}
      {loading ? (
        <div className="py-10 text-center text-slate-400">Cargando...</div>
      ) : cortes.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <BanknotesIcon className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-slate-400 font-medium">Sin cortes de nómina</p>
          <p className="text-slate-400 text-sm">Crea el primer corte para calcular los pagos del período</p>
          <Button onClick={() => setModal(true)}><PlusIcon className="w-4 h-4" /> Crear primer corte</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cortes.map(c => {
            const Icon       = STATUS_ICON[c.status] ?? ClockIcon
            const pendiente  = c.total_calculado - c.total_pagado
            const pctPagado  = c.total_calculado > 0 ? (c.total_pagado / c.total_calculado) * 100 : 0

            return (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors group">
                <div className="flex items-start gap-4 p-5">
                  {/* Ícono de estado */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.status === 'pagado' ? 'bg-emerald-100' : c.status === 'cerrado' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      c.status === 'pagado' ? 'text-emerald-600' : c.status === 'cerrado' ? 'text-blue-600' : 'text-yellow-600'
                    }`} />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{c.nombre}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.fecha_inicio} → {c.fecha_fin}
                          {c.empleados_count != null && (
                            <span className="ml-2">{c.empleados_count} empleado(s)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso de pago */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Pagado: {fmt(c.total_pagado)}</span>
                        <span>Total: {fmt(c.total_calculado)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${c.status === 'pagado' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(pctPagado, 100)}%` }}
                        />
                      </div>
                      {pendiente > 0 && (
                        <p className="text-xs text-amber-600 font-medium">Pendiente: {fmt(pendiente)}</p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.status === 'borrador' && (
                      <button onClick={() => handleDelete(c)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/nomina/${c.id}`}
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Abrir →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nuevo corte */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo corte de nómina" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nombre del corte *" value={form.nombre} onChange={set('nombre')} required
            placeholder="Ej: 1ª Quincena — Mayo 2026" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio *" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} required />
            <Input label="Fecha fin *" type="date" value={form.fecha_fin} onChange={set('fecha_fin')} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={set('observaciones')} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <p className="text-xs text-blue-600">Al crear el corte, el sistema calcula automáticamente el total por empleado sumando todas las hojas de producción del período seleccionado.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Calculando...' : 'Crear y calcular'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
