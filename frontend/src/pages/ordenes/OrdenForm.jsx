import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { createOrden } from '../../api/ordenes'
import { getEstilos } from '../../api/catalogos'

const EMPTY = {
  cliente_id:      '',
  estilo_id:        '',
  modelo:           '',
  corte:            '',
  cantidad_piezas:  '',
  fecha_entrega:    '',
  prioridad:        'media',
  observaciones:    '',
}

export default function OrdenForm({ open, onClose, onSuccess, clientes = [] }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [estilos, setEstilos] = useState([])

  // Cargar estilos una sola vez
  useEffect(() => {
    getEstilos({ per_page: 200 }).then(r => setEstilos(r.data.data ?? [])).catch(() => {})
  }, [])

  // Precargar modelo desde el estilo seleccionado
  const set = (k) => (e) => {
    const val = e.target.value
    if (k === 'estilo_id' && val) {
      const est = estilos.find(s => String(s.id) === String(val))
      setForm(f => ({ ...f, estilo_id: val, modelo: est ? est.nombre : f.modelo }))
    } else {
      setForm(f => ({ ...f, [k]: val }))
    }
  }

  const resetForm = () => { setForm(EMPTY); setErrors({}) }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.estilo_id)       delete payload.estilo_id
      if (!payload.cantidad_piezas) delete payload.cantidad_piezas
      else payload.cantidad_piezas = Number(payload.cantidad_piezas)
      await createOrden(payload)
      onSuccess()
      resetForm()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { resetForm(); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Nueva orden de producción" size="lg">
      <form onSubmit={submit} className="space-y-4">

        {/* Fila 1: Cliente + Prioridad */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Select
              label="Cliente *"
              value={form.cliente_id}
              onChange={set('cliente_id')}
              required
              placeholder="Seleccionar cliente"
              options={clientes.map((c) => ({ value: c.id, label: c.nombre }))}
              error={errors.cliente_id?.[0]}
            />
          </div>
          <Select
            label="Prioridad"
            value={form.prioridad}
            onChange={set('prioridad')}
            options={[
              { value: 'alta',  label: '🔴 Alta' },
              { value: 'media', label: '🟡 Media' },
              { value: 'baja',  label: '🟢 Baja' },
            ]}
          />
        </div>

        {/* Fila 2: Estilo + Modelo */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Estilo"
            value={form.estilo_id}
            onChange={set('estilo_id')}
            placeholder="— Sin estilo —"
            options={estilos.map((s) => ({ value: s.id, label: `${s.codigo ? s.codigo + ' — ' : ''}${s.nombre}` }))}
            error={errors.estilo_id?.[0]}
          />
          <Input
            label="Modelo / Descripción"
            value={form.modelo}
            onChange={set('modelo')}
            placeholder="Se rellena desde el estilo"
            error={errors.modelo?.[0]}
          />
        </div>

        {/* Fila 3: Corte + Cantidad + Fecha entrega */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Número de corte"
            value={form.corte}
            onChange={set('corte')}
            placeholder="ej. C-001"
            error={errors.corte?.[0]}
          />
          <Input
            label="Cantidad de piezas"
            type="number"
            min="1"
            value={form.cantidad_piezas}
            onChange={set('cantidad_piezas')}
            placeholder="0"
            error={errors.cantidad_piezas?.[0]}
          />
          <Input
            label="Fecha de entrega"
            type="date"
            value={form.fecha_entrega}
            onChange={set('fecha_entrega')}
            error={errors.fecha_entrega?.[0]}
          />
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            value={form.observaciones}
            onChange={set('observaciones')}
          />
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear orden'}</Button>
        </div>
      </form>
    </Modal>
  )
}
