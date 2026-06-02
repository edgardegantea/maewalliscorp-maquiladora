import api from './axios'
export const getOperaciones = (params) => api.get('/operaciones-prenda', { params })
export const getOperacion = (id) => api.get(`/operaciones-prenda/${id}`)
export const createOperacion = (data) => api.post('/operaciones-prenda', data)
export const updateOperacion = (id, data) => api.put(`/operaciones-prenda/${id}`, data)
export const deleteOperacion = (id) => api.delete(`/operaciones-prenda/${id}`)

export const getHojas = (params) => api.get('/hojas-produccion', { params })
export const getHoja = (id) => api.get(`/hojas-produccion/${id}`)
export const createHoja = (data) => api.post('/hojas-produccion', data)
export const updateHoja = (id, data) => api.put(`/hojas-produccion/${id}`, data)
export const deleteHoja = (id) => api.delete(`/hojas-produccion/${id}`)
// Operaciones individuales
export const addHojaOp     = (hojaId, data) => api.post(`/hojas-produccion/${hojaId}/operaciones`, data)
export const updateHojaOp  = (opId, data)   => api.put(`/hoja-operaciones/${opId}`, data)
export const deleteHojaOp  = (opId)         => api.delete(`/hoja-operaciones/${opId}`)

// Descarga el PDF de una hoja; devuelve el blob para abrir en nueva pestaña
export const descargarHojaPdf = async (id) => {
  const response = await api.get(`/hojas-produccion/${id}/pdf`, { responseType: 'blob' })
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href  = url
  link.setAttribute('download', `hoja-${String(id).padStart(5, '0')}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
