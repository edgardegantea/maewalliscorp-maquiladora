import { useState, useEffect } from 'react'
import { getPortalAclaraciones, createAclaracion } from '../../api/portal'
import { getPortalPagos } from '../../api/portal'
import { ChatBubbleLeftEllipsisIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  pendiente:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  en_revision: 'bg-blue-100 text-blue-800 border-blue-200',
  resuelta:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazada:   'bg-red-100 text-red-800 border-red-200',
}
const STATUS_LABEL = {
  pendiente: 'Pendiente', en_revision: 'En revisión',
  resuelta: 'Resuelta', rechazada: 'Rechazada',
}

function NuevaAclaracionModal({ hojas, onClose, onCreated }) {
  const [form, setForm] = useState({ hoja_produccion_id: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.descripcion.trim()) { setError('La descripción es requerida'); return }
    setSaving(true)
    setError('')
    try {
      await createAclaracion({
        hoja_produccion_id: form.hoja_produccion_id || null,
        descripcion: form.descripcion,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al enviar la aclaración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Nueva Aclaración</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hoja de producción relacionada <span className="text-slate-400">(opcional)</span>
            </label>
            <select
              value={form.hoja_produccion_id}
              onChange={e => setForm(f => ({ ...f, hoja_produccion_id: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Sin hoja específica</option>
              {hojas.map(h => (
                <option key={h.id} value={h.id}>
                  {(h.fecha_inicio ?? '').slice(0,10)} al {(h.fecha_fin ?? '').slice(0,10)}
                  {h.orden_codigo ? ` — ${h.orden_codigo}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción de la aclaración *
            </label>
            <textarea
              rows={5}
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describe la diferencia o problema que observaste en tu producción…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Enviando…' : 'Enviar aclaración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MisAclaracionesPage() {
  const [aclaraciones, setAclaraciones] = useState([])
  const [hojas, setHojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [{ data: a }, { data: p }] = await Promise.all([
        getPortalAclaraciones(),
        getPortalPagos(),
      ])
      setAclaraciones(a)
      setHojas(p.hojas ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-800">Aclaraciones de Producción</h2>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" /> Nueva aclaración
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Si notas que las piezas o importes registrados en tu hoja de producción no coinciden con tu trabajo real, envía una aclaración para que el encargado la revise.
      </p>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : aclaraciones.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ChatBubbleLeftEllipsisIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No tienes aclaraciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aclaraciones.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-slate-400">{(a.created_at ?? '').slice(0,10)}</p>
                  {a.hoja?.orden && (
                    <p className="text-sm font-medium text-blue-700 mt-0.5">
                      Hoja: {(a.hoja?.fecha_inicio ?? '').slice(0,10)} — Orden {a.hoja?.orden?.codigo}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[a.status] ?? STATUS_BADGE.pendiente}`}>
                  {STATUS_LABEL[a.status] ?? a.status}
                </span>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-3">
                {a.descripcion}
              </p>

              {a.respuesta && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Respuesta del encargado</p>
                  <p className="text-sm text-blue-800">{a.respuesta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <NuevaAclaracionModal
          hojas={hojas}
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); cargar() }}
        />
      )}
    </div>
  )
}
