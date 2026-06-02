import api from './axios'

export const getCortes    = (params)        => api.get('/cortes-nomina', { params })
export const getCorte     = (id)            => api.get(`/cortes-nomina/${id}`)
export const createCorte  = (data)          => api.post('/cortes-nomina', data)
export const updateCorte  = (id, data)      => api.put(`/cortes-nomina/${id}`, data)
export const deleteCorte  = (id)            => api.delete(`/cortes-nomina/${id}`)
export const calcularCorte = (id)           => api.post(`/cortes-nomina/${id}/calcular`)
export const pagarTodos   = (id, data)      => api.post(`/cortes-nomina/${id}/pagar-todos`, data)
export const registrarPago = (corteId, empId, data) => api.post(`/cortes-nomina/${corteId}/pago/${empId}`, data)
export const actualizarLinea = (corteId, empId, data) => api.patch(`/cortes-nomina/${corteId}/linea/${empId}`, data)
export const getHojasEmpleado = (corteId, empId) => api.get(`/cortes-nomina/${corteId}/hojas/${empId}`)
