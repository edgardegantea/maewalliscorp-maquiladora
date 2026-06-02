import api from './axios'

export const getReporteProduccion  = (params) => api.get('/reportes/produccion',  { params })
export const getReporteOrdenes     = ()        => api.get('/reportes/ordenes')
export const getReporteInventario  = ()        => api.get('/reportes/inventario')
