# Sistema de Administración de Maquiladora

Plataforma web para gestión de producción textil/maquiladora.  
Stack: **Laravel 12** (API REST) + **React 19** (SPA) · Monorepo

---

## Estructura del proyecto

```
maquiladora/
├── backend/          # Laravel 12 — API REST + JWT
└── frontend/         # React 19 + Vite + Tailwind v4 + Zustand
```

## Módulos implementados

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Registro de empresa, login JWT, refresh token, logout |
| **Órdenes de Producción** | CRUD completo con estados, prioridades, muestras, procesos |
| **Procesos de Producción** | Fases (Habilitación / Ensamble) por orden, con eventualidades |
| **Operaciones de Prenda** | Desglose de operaciones con precios, empleados asignados y maquileros foráneos |
| **Hojas de Producción** | Hoja diaria/semanal por empleado con cálculo de totales |
| **Empleados** | CRUD, datos de contacto, número de huella, status |
| **Asistencia** | Registro de entrada/salida/comida por empleado y fecha |
| **Áreas** | Áreas de producción con asignación de encargados |
| **Clientes** | Catálogo de clientes con razón social |
| **Estilos** | Catálogo de estilos/modelos por categoría |
| **Tallas** | Catálogo de tallas |
| **Líneas de Producción** | Líneas con código y ubicación |
| **Eventualidades del Trabajo** | Registro de incidencias con fechas |
| **Días Laborables** | Configuración de días de trabajo por empresa |
| **Empresa** | Datos generales de la empresa |
| **Reportes** | Dashboard de estadísticas (extensible) |

## Inicio rápido (desarrollo)

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD, JWT_SECRET
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Crear primera cuenta

Acceder a `http://localhost:5173/register` y registrar empresa + administrador.

## Base de datos

MySQL · 22 tablas · Migraciones en `backend/database/migrations/`

| Tabla | Descripción |
|-------|-------------|
| `empresas` | Empresa principal |
| `empleados` | Personal con datos biométricos |
| `registro_asistencia` | Marcación diaria |
| `areas` | Áreas de producción |
| `area_encargados` | Historial de encargados por área |
| `clientes` | Clientes de la maquiladora |
| `estilos` | Estilos/modelos de prendas |
| `tallas` | Catálogo de tallas |
| `lineas_produccion` | Líneas de producción |
| `ordenes_produccion` | Órdenes de trabajo |
| `muestras` | Muestras por orden |
| `fichas_especificaciones` | Fichas técnicas por orden |
| `eventualidades_trabajo` | Incidencias laborales |
| `procesos_produccion` | Procesos por orden y fase |
| `proceso_eventualidades` | Pivot proceso ↔ eventualidad |
| `operaciones_prenda` | Desglose de operaciones |
| `operacion_empleados` | Empleados asignados por operación |
| `hojas_produccion` | Hojas de pago por empleado |
| `hoja_operaciones` | Operaciones dentro de una hoja |
| `hoja_eventualidades` | Pivot hoja ↔ eventualidad |
| `dias_laborables` | Calendario laboral por empresa |
| `users` | Usuarios del sistema (admin/encargado/empleado) |

## API REST

Prefijo: `/api` · Auth: `Bearer <JWT>`

- `POST /api/auth/register` — Registro (crea empresa + admin)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `GET|POST /api/ordenes`
- `GET|PUT|DELETE /api/ordenes/{id}`
- `GET|POST /api/ordenes/{id}/muestras`
- `GET|POST /api/ordenes/{id}/procesos`
- `GET|POST /api/ordenes/{id}/fichas`
- `GET|POST /api/empleados`
- `GET|POST /api/asistencia`
- `GET|POST /api/hojas-produccion`
- `GET|POST /api/operaciones-prenda`
- `GET|POST /api/clientes`
- `GET|POST /api/estilos`
- `GET|POST /api/areas`
- `GET|POST /api/eventualidades`
- `GET|POST /api/lineas-produccion`
- `GET|POST /api/tallas`
- `GET|POST /api/dias-laborables`
- `GET|PUT  /api/empresa`

## Flujo de producción

```
Cliente → Orden de Producción → Muestra (aprobación)
                              → Ficha de Especificaciones
                              → Procesos (Habilitación / Ensamble)
                                         ↓
                              Operaciones de Prenda
                                         ↓
                              Hojas de Producción (pago por empleado)
```
