import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import Modal from '../../components/ui/Modal'
import QRCodeCard from '../../components/ui/QRCodeCard'
import { getOrdenes } from '../../api/ordenes'
import { getClientes } from '../../api/catalogos'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import OrdenForm from './OrdenForm'
import { toast } from '../../components/ui/Toast'

const PRIORIDAD_ORDER = { alta: 0, media: 1, baja: 2 }
const STATUS_STYLES = {
  pendiente:  'bg-yellow-50 border-yellow-200 text-yellow-700',
  en_proceso: 'bg-blue-50 border-blue-200 text-blue-700',
  completada: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  cancelada:  'bg-slate-50 border-slate-200 text-slate-500',
}

const today = () => new Date().toISOString().split('T')[0]

export default function OrdenesPage() {
  const navigate = useNavigate()
  const [ordenes, setOrdenes]   = useState([])
  const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState([])
  const [qrTarget, setQrTarget] = useState(null)

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await getOrdenes({ search, status, page })
      setOrdenes(data.data)
      setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => { load() }, [load])
  useEffect(() => { getClientes({ per_page: 100 }).then(r => setClientes(r.data.data)) }, [])

  // KPIs computados de la página actual
  const hoy = today()
  const counts = ordenes.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    if (o.status !== 'completada' && o.status !== 'cancelada' && o.fecha_entrega && o.fecha_entrega < hoy) {
      acc._vencidas = (acc._vencidas ?? 0) + 1
    }
    return acc
  }, {})

  const KPI_DEFS = [
    { label: 'Total (pág.)',  value: ordenes.length,             bg: 'bg-white border-slate-200',         text: 'text-slate-800' },
    { label: 'En proceso',    value: counts.en_proceso ?? 0,     bg: 'bg-blue-50 border-blue-200',        text: 'text-blue-700' },
    { label: 'Pendientes',    value: counts.pendiente ?? 0,      bg: 'bg-yellow-50 border-yellow-200',    text: 'text-yellow-700' },
    { label: 'Vencidas',      value: counts._vencidas ?? 0,      bg: 'bg-red-50 border-red-200',          text: 'text-red-700' },
    { label: 'Completadas',   value: counts.completada ?? 0,     bg: 'bg-emerald-50 border-emerald-100',  text: 'text-emerald-700' },
  ]

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {KPI_DEFS.map(k => (
          <div key={k.label} className={`rounded-xl border p-3 ${k.bg}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${k.text} opacity-70`}>{k.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${k.text}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              placeholder="Buscar código o modelo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <span className="text-sm text-slate-400">{meta.total} órdenes</span>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="w-4 h-4" /> Nueva orden
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Código', 'Modelo', 'Cliente', 'Entrega', 'Prioridad', 'Estado', 'Corte', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Cargando…</td></tr>
            ) : ordenes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Sin órdenes</td></tr>
            ) : ordenes.map(o => {
              const vencida = o.fecha_entrega && o.fecha_entrega < hoy && !['completada', 'cancelada'].includes(o.status)
              return (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/ordenes/${o.id}`)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${vencida ? 'bg-red-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 font-semibold">{o.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.modelo || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{o.cliente?.nombre ?? '—'}</td>
                  <td className={`px-4 py-3 text-sm ${vencida ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                    {o.fecha_entrega ?? '—'}
                    {vencida && <span className="ml-1 text-xs">⚠️</span>}
                  </td>
                  <td className="px-4 py-3"><Badge value={o.prioridad} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[o.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.corte_comenzado
                      ? <span className="text-xs font-medium text-emerald-600">Comenzado</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setQrTarget(o) }}
                        title="Ver QR de la orden"
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/ordenes/${o.id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Ver →
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Página {meta.current_page} de {meta.last_page}</span>
          <div className="flex gap-1">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => load(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === meta.current_page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal QR orden */}
      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title="Código QR de la orden" size="sm">
        {qrTarget && (
          <QRCodeCard
            value={qrTarget.codigo}
            label={qrTarget.codigo}
            subtitle={`Cliente: ${qrTarget.cliente?.nombre ?? '—'}`}
            extra={`Modelo: ${qrTarget.modelo ?? '—'} · ${qrTarget.status}`}
            size={200}
          />
        )}
        <p className="text-xs text-slate-400 text-center mt-3">
          Escanea este QR en el formulario de Hoja de Producción para seleccionar la orden automáticamente.
        </p>
      </Modal>

      <OrdenForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); load(); toast.success('Orden creada') }}
        clientes={clientes}
      />
    </div>
  )
}
