import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { ToastContainer } from '../ui/Toast'
import useAuthStore from '../../stores/authStore'

const TITLES = {
  // Principal
  '/': 'Dashboard',
  // Producción
  '/ordenes':              'Órdenes de Producción',
  '/hojas-produccion':     'Hojas de Producción',
  '/operaciones-prenda':   'Operaciones de Prenda',
  '/estilos':              'Estilos',
  '/lineas-produccion':    'Líneas de Producción',
  // Inventario
  '/telas':                'Telas',
  '/avios':                'Avíos',
  '/tallas':               'Tallas',
  '/proveedores':          'Proveedores',
  '/movimientos-almacen':  'Movimientos de Almacén',
  // Comercial
  '/articulos':            'Artículos / SKU',
  '/listas-precios':       'Listas de Precios',
  '/talleres':             'Talleres Externos',
  '/clientes':             'Clientes',
  // Finanzas
  '/nomina':               'Nómina',
  '/cuentas-pagar':        'Cuentas por Pagar',
  // RRHH
  '/empleados':            'Empleados',
  '/asistencia':           'Control de Asistencia',
  '/areas':                'Áreas y Encargados',
  '/eventualidades':       'Eventualidades del Trabajo',
  // Gestión
  '/gestion/permisos':     'Gestión de Permisos',
  '/gestion/aclaraciones': 'Gestión de Aclaraciones',
  // Sistema
  '/reportes':             'Reportes',
  '/configuracion':        'Configuración',
  // Portal empleado
  '/portal/produccion':    'Mi Producción',
  '/portal/pagos':         'Mis Pagos',
  '/portal/ordenes':       'Mis Órdenes',
  '/portal/asistencia':    'Mi Asistencia',
  '/portal/permisos':      'Mis Permisos',
  '/portal/aclaraciones':  'Mis Aclaraciones',
}

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  // Coincidencia por prefijo (ej. /ordenes/5 → Órdenes de Producción)
  const match = Object.entries(TITLES)
    .filter(([k]) => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b[0].length - a[0].length)[0]
  return match?.[1] ?? 'Maquiladora'
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Redirección por rol al acceder al root
  useEffect(() => {
    if (user?.role === 'empleado' && pathname === '/') {
      navigate('/portal/produccion', { replace: true })
    }
  }, [user, pathname, navigate])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={resolveTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
