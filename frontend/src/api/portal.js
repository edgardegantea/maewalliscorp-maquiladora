import api from './axios'

// ── Portal empleado ──────────────────────────────────────────────────────────
export const getPortalProduccion   = (params)     => api.get('/portal/produccion',    { params })
export const getPortalPagos        = (params)     => api.get('/portal/pagos',         { params })
export const getPortalAsistencia   = (params)     => api.get('/portal/asistencia',    { params })
export const getPortalOrdenes      = ()           => api.get('/portal/ordenes')
export const getPortalPermisos     = ()           => api.get('/portal/permisos')
export const createPermiso         = (data)       => api.post('/portal/permisos',     data)
export const deletePermiso         = (id)         => api.delete(`/portal/permisos/${id}`)
export const getPortalAclaraciones = ()           => api.get('/portal/aclaraciones')
export const createAclaracion      = (data)       => api.post('/portal/aclaraciones', data)

// ── Gestión admin / encargado ────────────────────────────────────────────────
export const getGestionPermisos        = (params)       => api.get('/gestion/permisos',                { params })
export const updateGestionPermiso      = (id, data)     => api.put(`/gestion/permisos/${id}`,          data)
export const getGestionAclaraciones    = (params)       => api.get('/gestion/aclaraciones',            { params })
export const updateGestionAclaracion   = (id, data)     => api.put(`/gestion/aclaraciones/${id}`,      data)
