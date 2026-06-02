import { useState, useEffect } from 'react'
import { getPortalPermisos, createPermiso, deletePermiso } from '../../api/portal'
import { CalendarDaysIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200',
}
const STATUS_LABEL = {
  pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado',
}
const TIPO_LABEL = {
  vacaciones:       'Vacaciones',
  permiso_personal: 'Permiso personal',
  incapacidad:      'Incapacidad',
  otro:             'Otro',
}
const TIPO_ICON = {
  vacaciones:       '🌴',
  permiso_personal: '🙋',
  incapacidad:      '🏥',
  otro:             '📋',
}

const TIPOS = ['vacaciones', 'permiso_personal', 'incapacidad', 'otro']

function SolicitarPermisoModal({ onClose, onCreated }) {
  const hoy = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ tipo: 'vacaciones', fecha_inicio: hoy, fecha_fin: hoy, motivo: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const diasSolicitados = () => {
    if (!form.fecha_inicio || !form.fecha_fin) return 0
    const a = new Date(form.fecha_inicio)
    const b = new Date(form.fecha_fin)
    return Math.max(0, Math.round((b - a) / 86400000) + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.motivo.trim()) { setError('El motivo es requerido'); return }
    setSaving(true); setError('')
    try {
      await createPermiso(form)
      onCreated()
    } catch (err) {
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message ?? 'Error al solicitar permiso'))
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Solicitar Permiso</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de permiso</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    form.tipo === t
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{TIPO_ICON[t]}</span> {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')}
                min={hoy}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha fin</label>
              <input type="date" value={form.fecha_fin} onChange={set('fecha_fin')}
                min={form.fecha_inicio || hoy}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500 -mt-1">
            {diasSolicitados()} día{diasSolicitados() !== 1 ? 's' : ''} solicitado{diasSolicitados() !== 1 ? 's' : ''}
          </p>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo *</label>
            <textarea
              rows={4}
              value={form.motivo}
              onChange={set('motivo')}
              placeholder="Explica el motivo de tu solicitud…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Enviando…' : 'Solicitar permiso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MisPermisosPage() {
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const cargar = () => {
    setLoading(true)
    getPortalPermisos()
      .then(r => setPermisos(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar esta solicitud de permiso?')) return
    setDeleting(id)
    try { await deletePermiso(id); cargar() }
    finally { setDeleting(null) }
  }

  const dias = (fi, ff) => {
    if (!fi || !ff) return '—'
    const a = new Date(fi), b = new Date(ff)
    const n = Math.max(0, Math.round((b - a) / 86400000) + 1)
    return `${n} día${n !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Mis Permisos</h2>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" /> Solicitar permiso
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : permisos.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No tienes solicitudes de permiso</p>
        </div>
      ) : (
        <div className="space-y-3">
          {permisos.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TIPO_ICON[p.tipo]}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{TIPO_LABEL[p.tipo]}</p>
                    <p className="text-sm text-slate-500">
                      {(p.fecha_inicio ?? '').slice(0,10)} al {(p.fecha_fin ?? '').slice(0,10)}
                      {' · '}{dias(p.fecha_inicio, p.fecha_fin)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[p.status] ?? STATUS_BADGE.pendiente}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.status === 'pendiente' && (
                    <button
                      onClick={() => cancelar(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancelar solicitud"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{p.motivo}</p>

              {p.observaciones_encargado && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Respuesta del encargado</p>
                  <p className="text-sm text-blue-800">{p.observaciones_encargado}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <SolicitarPermisoModal
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); cargar() }}
        />
      )}
    </div>
  )
}
