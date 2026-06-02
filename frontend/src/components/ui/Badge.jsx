const variants = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-green-100 text-green-700',
  pendiente: 'bg-gray-100 text-gray-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  completada: 'bg-green-100 text-green-700',
  completado: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  activo: 'bg-emerald-100 text-emerald-700',
  inactivo: 'bg-slate-100 text-slate-500',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  habilitacion: 'bg-purple-100 text-purple-700',
  ensamble: 'bg-indigo-100 text-indigo-700',
  otro: 'bg-gray-100 text-gray-600',
}
export default function Badge({ value, label }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[value] ?? 'bg-gray-100 text-gray-700'}`}>
      {label ?? value}
    </span>
  )
}
