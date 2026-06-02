import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import api from '../../api/axios'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CubeIcon,
  SparklesIcon,
  TruckIcon,
  BanknotesIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ListBulletIcon,
  ChatBubbleLeftEllipsisIcon,
  RectangleGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

// ── Menú del ADMINISTRADOR ───────────────────────────────────────────────────
const GROUPS_ADMIN = [
  {
    label: 'Principal',
    items: [{ to: '/', label: 'Dashboard', icon: HomeIcon }],
  },
  {
    label: 'Producción',
    items: [
      { to: '/ordenes',            label: 'Órdenes',              icon: ClipboardDocumentListIcon },
      { to: '/hojas-produccion',   label: 'Hojas de Producción',  icon: DocumentTextIcon },
      { to: '/operaciones-prenda', label: 'Operaciones',          icon: WrenchScrewdriverIcon },
      { to: '/estilos',            label: 'Estilos',              icon: SwatchIcon },
      { to: '/lineas-produccion',  label: 'Líneas de Producción', icon: RectangleGroupIcon },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { to: '/telas',               label: 'Telas',          icon: SparklesIcon },
      { to: '/avios',               label: 'Avíos',          icon: CubeIcon },
      { to: '/tallas',              label: 'Tallas',         icon: ListBulletIcon },
      { to: '/proveedores',         label: 'Proveedores',    icon: TruckIcon },
      { to: '/movimientos-almacen', label: 'Movimientos',    icon: ArrowsRightLeftIcon },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/articulos',      label: 'Artículos / SKU',   icon: ShoppingBagIcon },
      { to: '/listas-precios', label: 'Listas de Precios', icon: TagIcon },
      { to: '/talleres',       label: 'Talleres Externos',  icon: BuildingStorefrontIcon },
      { to: '/clientes',       label: 'Clientes',           icon: BuildingOffice2Icon },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/nomina',       label: 'Nómina',            icon: CurrencyDollarIcon },
      { to: '/cuentas-pagar',label: 'Cuentas por Pagar', icon: BanknotesIcon },
    ],
  },
  {
    label: 'RRHH',
    items: [
      { to: '/empleados',            label: 'Empleados',      icon: UserGroupIcon },
      { to: '/asistencia',           label: 'Asistencia',     icon: CalendarDaysIcon },
      { to: '/areas',                label: 'Áreas',          icon: BuildingOffice2Icon },
      { to: '/eventualidades',       label: 'Eventualidades', icon: ExclamationTriangleIcon },
      { to: '/gestion/permisos',     label: 'Permisos',       icon: CalendarDaysIcon },
      { to: '/gestion/aclaraciones', label: 'Aclaraciones',   icon: ChatBubbleLeftEllipsisIcon },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/reportes',      label: 'Reportes',      icon: ChartBarIcon },
      { to: '/configuracion', label: 'Configuración', icon: Cog6ToothIcon },
    ],
  },
]

// ── Menú del ENCARGADO ───────────────────────────────────────────────────────
const GROUPS_ENCARGADO = [
  {
    label: 'Principal',
    items: [{ to: '/', label: 'Dashboard', icon: HomeIcon }],
  },
  {
    label: 'Producción',
    items: [
      { to: '/ordenes',            label: 'Órdenes',             icon: ClipboardDocumentListIcon },
      { to: '/hojas-produccion',   label: 'Hojas de Producción', icon: DocumentTextIcon },
      { to: '/operaciones-prenda', label: 'Operaciones',         icon: WrenchScrewdriverIcon },
      { to: '/estilos',            label: 'Estilos',             icon: SwatchIcon },
    ],
  },
  {
    label: 'RRHH',
    items: [
      { to: '/empleados',            label: 'Empleados',      icon: UserGroupIcon },
      { to: '/asistencia',           label: 'Asistencia',     icon: CalendarDaysIcon },
      { to: '/areas',                label: 'Áreas',          icon: BuildingOffice2Icon },
      { to: '/eventualidades',       label: 'Eventualidades', icon: ExclamationTriangleIcon },
      { to: '/gestion/permisos',     label: 'Permisos',       icon: CalendarDaysIcon },
      { to: '/gestion/aclaraciones', label: 'Aclaraciones',   icon: ChatBubbleLeftEllipsisIcon },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/reportes', label: 'Reportes', icon: ChartBarIcon },
    ],
  },
]

// ── Menú del EMPLEADO ────────────────────────────────────────────────────────
const GROUPS_EMPLEADO = [
  {
    label: 'Mi Portal',
    items: [
      { to: '/portal/produccion',   label: 'Mi Producción', icon: DocumentTextIcon },
      { to: '/portal/pagos',        label: 'Mis Pagos',     icon: BanknotesIcon },
      { to: '/portal/ordenes',      label: 'Mis Órdenes',   icon: ClipboardDocumentListIcon },
      { to: '/portal/asistencia',   label: 'Mi Asistencia', icon: CalendarDaysIcon },
      { to: '/portal/permisos',     label: 'Mis Permisos',  icon: CalendarDaysIcon },
      { to: '/portal/aclaraciones', label: 'Aclaraciones',  icon: ChatBubbleLeftEllipsisIcon },
    ],
  },
]

const GROUPS_BY_ROLE = {
  admin:     GROUPS_ADMIN,
  encargado: GROUPS_ENCARGADO,
  empleado:  GROUPS_EMPLEADO,
}

// ── NavGroup ─────────────────────────────────────────────────────────────────
function NavGroup({ label, items, defaultOpen = true, badges = {} }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
      >
        {label}
        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {items.map(({ to, label: lbl, icon: Icon }) => {
            const badge = badges[to] ?? 0
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{lbl}</span>
                {badge > 0 && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none min-w-[1.25rem] text-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user } = useAuthStore()
  const role   = user?.role ?? 'admin'
  const groups = GROUPS_BY_ROLE[role] ?? GROUPS_ADMIN

  const ROLE_LABEL = { admin: 'Administrador', encargado: 'Encargado', empleado: 'Empleado' }
  const ROLE_COLOR = { admin: 'text-blue-400',  encargado: 'text-amber-400', empleado: 'text-emerald-400' }

  // Badges: pendientes de permisos/aclaraciones para admin y encargado
  const [badges, setBadges] = useState({})
  useEffect(() => {
    if (role !== 'admin' && role !== 'encargado') return
    const load = async () => {
      try {
        const [perm, aclar] = await Promise.all([
          api.get('/gestion/permisos', { params: { status: 'pendiente', per_page: 1 } }),
          api.get('/gestion/aclaraciones', { params: { status: 'pendiente', per_page: 1 } }),
        ])
        setBadges({
          '/gestion/permisos':     perm.data?.total  ?? perm.data?.length  ?? 0,
          '/gestion/aclaraciones': aclar.data?.total ?? aclar.data?.length ?? 0,
        })
      } catch { /* silencioso */ }
    }
    load()
    const timer = setInterval(load, 60_000) // refrescar cada minuto
    return () => clearInterval(timer)
  }, [role])

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700 shrink-0">
        <h1 className="text-lg font-bold text-blue-400">Maquiladora</h1>
        <p className="text-xs text-slate-400 mt-0.5">Sistema de Producción</p>
        <p className={`text-xs font-semibold mt-2 ${ROLE_COLOR[role]}`}>
          {user?.name} · {ROLE_LABEL[role] ?? role}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-2">
        {groups.map((g, i) => (
          <NavGroup
            key={g.label}
            label={g.label}
            items={g.items}
            defaultOpen={role === 'empleado' ? true : i < 4}
            badges={badges}
          />
        ))}
      </nav>
    </aside>
  )
}
