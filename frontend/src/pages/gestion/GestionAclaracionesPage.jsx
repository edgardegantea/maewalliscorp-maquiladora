import { useState, useEffect, useCallback } from 'react'
import { getGestionAclaraciones, updateGestionAclaracion } from '../../api/portal'
import { getEmpleados } from '../../api/empleados'
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  pendiente:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  en_revision: 'bg-blue-100 text-blue-800 border-blue-200',
  resuelta:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazada:   'bg-red-100 text-red-800 border-red-200',
}
const STATUS_LABEL = {
  pendiente:'Pendiente', en_revision:'En revisión', resuelta:'Resuelta', rechazada:'Rechazada',
}

function ResponderModal({ aclaracion, onClose, onSaved }) {
  const [form, setForm] = useState({ status: 'en_revision', respuesta: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateGestionAclaracion(aclaracion.id, form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Responder Aclaración</h3>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            {aclaracion.empleado?.apellidos} {aclaracion.empleado?.nombre}
          </p>
          {aclaracion.hoja?.orden && (
            <p className="text-xs text-blue-600 mt-0.5">
              Hoja: {(aclaracion.hoja?.fecha_inicio ?? '').slice(0,10)} — Orden {aclaracion.hoja?.orden?.codigo}
            </p>
          )}
          <p className="text-sm text-slate-600 mt-2 bg-white rounded-lg p-3 border border-slate-200">{aclaracion.descripcion}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo estado</label>
            <div className="flex gap-2 flex-wrap">
              {['en_revision','resuelta','rechazada'].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.status === s
                      ? s === 'resuelta' ? 'bg-emerald-600 text-white border-emerald-600'
                        : s === 'rechazada' ? 'bg-red-600 text-white border-red-600'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Respuesta</label>
            <textarea
              rows={4}
              value={form.respuesta}
              onChange={e => setForm(f => ({ ...f, respuesta: e.target.value }))}
              placeholder="Escribe tu respuesta o explicación para el empleado…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar respuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GestionAclaracionesPage() {
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
      const { data: d } = await getGestionAclaraciones(p)
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
        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-violet-600" />
        <h2 className="text-lg font-bold text-slate-800">Gestión de Aclaraciones</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filtros.status} onChange={setF('status')} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
            <div className="text-center py-16 text-slate-400">Sin aclaraciones</div>
          )}
          {(data?.data ?? []).map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">{a.empleado?.apellidos} {a.empleado?.nombre}</p>
                    <span className="text-xs text-slate-400">{(a.created_at ?? '').slice(0,10)}</span>
                  </div>
                  {a.hoja?.orden && (
                    <p className="text-xs text-blue-600 mb-2">
                      Hoja: {(a.hoja?.fecha_inicio ?? '').slice(0,10)} — Orden {a.hoja?.orden?.codigo}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{a.descripcion}</p>
                  {a.respuesta && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-2">
                      Respuesta: {a.respuesta}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                  {a.status !== 'resuelta' && a.status !== 'rechazada' && (
                    <button
                      onClick={() => setSelected(a)}
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
          aclaracion={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); cargar() }}
        />
      )}
    </div>
  )
}
