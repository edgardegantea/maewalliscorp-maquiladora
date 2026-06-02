import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'

// Layout
import AppLayout from './components/layout/AppLayout'

// Auth
import LoginPage           from './pages/auth/LoginPage'
import RegisterPage        from './pages/auth/RegisterPage'
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage   from './pages/auth/ResetPasswordPage'

// Principal
import DashboardPage          from './pages/DashboardPage'

// Producción
import OrdenesPage            from './pages/ordenes/OrdenesPage'
import OrdenDetailPage        from './pages/ordenes/OrdenDetailPage'
import HojasProduccionPage    from './pages/hojas/HojasProduccionPage'
import HojaDetailPage         from './pages/hojas/HojaDetailPage'
import OperacionesPrendaPage  from './pages/operaciones/OperacionesPrendaPage'
import EstilosPage            from './pages/estilos/EstilosPage'
import LineasProduccionPage   from './pages/produccion/LineasProduccionPage'

// Inventario
import TelasPage              from './pages/inventario/TelasPage'
import AviosPage              from './pages/inventario/AviosPage'
import TallasPage             from './pages/inventario/TallasPage'
import ProveedoresPage        from './pages/inventario/ProveedoresPage'
import MovimientosAlmacenPage from './pages/inventario/MovimientosAlmacenPage'

// Comercial
import ArticulosPage          from './pages/comercial/ArticulosPage'
import ListasPreciosPage      from './pages/comercial/ListasPreciosPage'
import TalleresPage           from './pages/comercial/TalleresPage'
import ClientesPage           from './pages/clientes/ClientesPage'

// Finanzas
import CuentasPagarPage       from './pages/finanzas/CuentasPagarPage'

// RRHH
import EmpleadosPage          from './pages/empleados/EmpleadosPage'
import AsistenciaPage         from './pages/empleados/AsistenciaPage'
import AreasPage              from './pages/areas/AreasPage'
import EventualidadesPage     from './pages/EventualidadesPage'

// Nómina
import NominaPage             from './pages/nomina/NominaPage'
import CorteNominaDetailPage  from './pages/nomina/CorteNominaDetailPage'

// Sistema
import ReportesPage           from './pages/reportes/ReportesPage'
import ConfiguracionPage      from './pages/ConfiguracionPage'

// Portal empleado
import MiProduccionPage       from './pages/portal/MiProduccionPage'
import MisPagosPage           from './pages/portal/MisPagosPage'
import MisAclaracionesPage    from './pages/portal/MisAclaracionesPage'
import MisOrdenesPage         from './pages/portal/MisOrdenesPage'
import MisPermisosPage        from './pages/portal/MisPermisosPage'
import MiAsistenciaPage       from './pages/portal/MiAsistenciaPage'

// Gestión admin/encargado
import GestionPermisosPage     from './pages/gestion/GestionPermisosPage'
import GestionAclaracionesPage from './pages/gestion/GestionAclaracionesPage'

// ── Spinner de carga ──────────────────────────────────────────────────────────
function SplashSpinner() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Verificando sesión…</p>
    </div>
  )
}

// ── Guardas de ruta ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuthStore()
  if (!authChecked) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuthStore()
  if (!authChecked) return null
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function AuthGuard({ children }) {
  const { initAuth } = useAuthStore()
  const [ready, setReady] = useState(false)
  useEffect(() => { initAuth().finally(() => setReady(true)) }, []) // eslint-disable-line
  if (!ready) return <SplashSpinner />
  return children
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          {/* Públicas */}
          <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* Protegidas dentro del layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

            {/* Dashboard */}
            <Route path="/"                        element={<DashboardPage />} />

            {/* Producción */}
            <Route path="/ordenes"                 element={<OrdenesPage />} />
            <Route path="/ordenes/:id"             element={<OrdenDetailPage />} />
            <Route path="/hojas-produccion"        element={<HojasProduccionPage />} />
            <Route path="/hojas-produccion/:id"    element={<HojaDetailPage />} />
            <Route path="/operaciones-prenda"      element={<OperacionesPrendaPage />} />
            <Route path="/estilos"                 element={<EstilosPage />} />
            <Route path="/lineas-produccion"       element={<LineasProduccionPage />} />

            {/* Inventario */}
            <Route path="/telas"                   element={<TelasPage />} />
            <Route path="/avios"                   element={<AviosPage />} />
            <Route path="/tallas"                  element={<TallasPage />} />
            <Route path="/proveedores"             element={<ProveedoresPage />} />
            <Route path="/movimientos-almacen"     element={<MovimientosAlmacenPage />} />

            {/* Comercial */}
            <Route path="/articulos"               element={<ArticulosPage />} />
            <Route path="/listas-precios"          element={<ListasPreciosPage />} />
            <Route path="/talleres"                element={<TalleresPage />} />
            <Route path="/clientes"                element={<ClientesPage />} />

            {/* Finanzas */}
            <Route path="/cuentas-pagar"           element={<CuentasPagarPage />} />

            {/* RRHH */}
            <Route path="/empleados"               element={<EmpleadosPage />} />
            <Route path="/asistencia"              element={<AsistenciaPage />} />
            <Route path="/areas"                   element={<AreasPage />} />
            <Route path="/eventualidades"          element={<EventualidadesPage />} />

            {/* Gestión RRHH */}
            <Route path="/gestion/permisos"        element={<GestionPermisosPage />} />
            <Route path="/gestion/aclaraciones"    element={<GestionAclaracionesPage />} />

            {/* Nómina */}
            <Route path="/nomina"                  element={<NominaPage />} />
            <Route path="/nomina/:id"              element={<CorteNominaDetailPage />} />

            {/* Sistema */}
            <Route path="/reportes"                element={<ReportesPage />} />
            <Route path="/configuracion"           element={<ConfiguracionPage />} />

            {/* Portal empleado */}
            <Route path="/portal/produccion"       element={<MiProduccionPage />} />
            <Route path="/portal/pagos"            element={<MisPagosPage />} />
            <Route path="/portal/ordenes"          element={<MisOrdenesPage />} />
            <Route path="/portal/asistencia"       element={<MiAsistenciaPage />} />
            <Route path="/portal/permisos"         element={<MisPermisosPage />} />
            <Route path="/portal/aclaraciones"     element={<MisAclaracionesPage />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  )
}
