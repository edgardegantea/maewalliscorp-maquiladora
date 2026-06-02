import { useState, useEffect, useCallback } from 'react'
import { getGestionPermisos, updateGestionPermiso } from '../../api/portal'
import { getEmpleados } from '../../api/empleados'
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200',
}
const STATUS_LABEL = {
  pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado',
}
const TIPO_LABEL = {
  vacaciones: 'Vacaciones', permiso_personal: 'Permiso personal',
  incapacidad: 'Incapacidad', otro: 'Otro',
}
const TIPO_ICON = { vacaciones:'🌴', permiso_personal:'🙋', incapacidad:'🏥', otro:'📋' }

function ResponderModal({ permiso, onClose, onSaved }) {
  const [form, setForm] = useState({ status: 'aprobado', observaciones_encargado: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateGestionPermiso(permiso.id, form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Responder solicitud</h3>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            {permiso.empleado?.apellidos} {permiso.empleado?.nombre}
          </p>
          <p className="text-sm text-slate-500">
            {TIPO_ICON[permiso.tipo]} {TIPO_LABEL[permiso.tipo]} · {(permiso.fecha_inicio ?? '').slice(0,10)} al {(permiso.fecha_fin ?? '').slice(0,10)}
          </p>
          <p className="text-sm text-slate-600 mt-2 bg-white rounded-lg p-3 border border-slate-200">{permiso.motivo}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="flex gap-3">
            {['aprobado','rechazado'].map(s => (
              <button
                key={s} type="button"
                onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.status === s
                    ? s === 'aprobado'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {s === 'aprobado' ? '✓ Aprobar' : '✗ Rechazar'}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comentario <span className="text-slate-400">(opcional)</span></label>
            <textarea
              rows={3}
              value={form.observaciones_encargado}
              onChange={e => setForm(f => ({ ...f, observaciones_encargado: e.target.value }))}
              placeholder="Agrega una observación para el empleado…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GestionPermisosPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ status: '', empleado_id: '' })
  const [empleados, setEmpleados] = useState([])
  const [selected, setSelected] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const p = {}
    if (filtros.status) p.status = filtros.status
    if (filtros.empleado_id) p.empleado_id = filtros.empleado_id
    try {
      const { data: d } = await getGestionPermisos(p)
      setData(d)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => { getEmpleados({ per_page: 200 }).then(r => setEmpleados(r.data.data)) }, [])

  const setF = (k) => (e) => setFiltros(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Gestión de Permisos</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filtros.status} onChange={setF('status')} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <select value={filtros.empleado_id} onChange={setF('empleado_id')} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los empleados</option>
          {empleados.map(e => <option key={e.id} value={e.id}>{e.apellidos} {e.nombre}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {(data?.data ?? []).length === 0 && (
            <div className="text-center py-16 text-slate-400">Sin solicitudes</div>
          )}
          {(data?.data ?? []).map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{p.empleado?.apellidos} {p.empleado?.nombre}</p>
                  <p className="text-sm text-slate-500">
                    {TIPO_ICON[p.tipo]} {TIPO_LABEL[p.tipo]} · {(p.fecha_inicio ?? '').slice(0,10)} al {(p.fecha_fin ?? '').slice(0,10)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{p.motivo}</p>
                  {p.observaciones_encargado && (
                    <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5 mt-2">
                      Tu respuesta: {p.observaciones_encargado}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  {p.status === 'pendiente' && (
                    <button
                      onClick={() => setSelected(p)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                    >
                      Responder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ResponderModal
          permiso={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); cargar() }}
        />
      )}
    </div>
  )
}
