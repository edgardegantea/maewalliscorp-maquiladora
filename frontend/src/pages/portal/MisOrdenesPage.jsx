import { useState, useEffect } from 'react'
import { getPortalOrdenes } from '../../api/portal'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

const PRIORIDAD_BADGE = {
  alta:  'bg-red-100 text-red-800 border-red-200',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  baja:  'bg-slate-100 text-slate-600 border-slate-200',
}
const STATUS_BADGE = {
  pendiente:  'bg-slate-100 text-slate-600 border-slate-200',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
  completada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelada:  'bg-red-100 text-red-700 border-red-200',
}
const STATUS_LABEL = {
  pendiente: 'Pendiente', en_proceso: 'En proceso',
  completada: 'Completada', cancelada: 'Cancelada',
}

export default function MisOrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortalOrdenes()
      .then(r => setOrdenes(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Mis Órdenes</h2>
        <span className="text-sm text-slate-400">— órdenes en las que tienes hojas de producción asignadas</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : ordenes.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No tienes órdenes asignadas</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordenes.map(o => (
            <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs text-slate-400 font-mono">{o.codigo}</p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{o.modelo}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[o.status] ?? STATUS_BADGE.pendiente}`}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente</span>
                  <span className="font-medium text-right max-w-[160px] truncate">{o.cliente ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega</span>
                  <span className="font-medium">{o.fecha_entrega ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Prioridad</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORIDAD_BADGE[o.prioridad] ?? PRIORIDAD_BADGE.baja}`}>
                    {o.prioridad ?? '—'}
                  </span>
                </div>
              </div>

              {o.observaciones && (
                <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 line-clamp-2">
                  {o.observaciones}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
