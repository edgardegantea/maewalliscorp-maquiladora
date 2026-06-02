import api from './axios'
export const getClientes = (params) => api.get('/clientes', { params })
export const createCliente = (data) => api.post('/clientes', data)
export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data)
export const deleteCliente = (id) => api.delete(`/clientes/${id}`)

export const getEstilos = (params) => api.get('/estilos', { params })
export const createEstilo = (data) => api.post('/estilos', data)
export const updateEstilo = (id, data) => api.put(`/estilos/${id}`, data)
export const deleteEstilo = (id) => api.delete(`/estilos/${id}`)

export const getTallas = () => api.get('/tallas')
export const createTalla = (data) => api.post('/tallas', data)
export const updateTalla = (id, data) => api.put(`/tallas/${id}`, data)
export const deleteTalla = (id) => api.delete(`/tallas/${id}`)

export const getAreas = () => api.get('/areas')
export const createArea = (data) => api.post('/areas', data)
export const updateArea = (id, data) => api.put(`/areas/${id}`, data)
export const deleteArea = (id) => api.delete(`/areas/${id}`)

export const getLineas = () => api.get('/lineas-produccion')
export const createLinea = (data) => api.post('/lineas-produccion', data)
export const updateLinea = (id, data) => api.put(`/lineas-produccion/${id}`, data)
export const deleteLinea = (id) => api.delete(`/lineas-produccion/${id}`)

export const getEventualidades = (params) => api.get('/eventualidades', { params })
export const createEventualidad = (data) => api.post('/eventualidades', data)
export const updateEventualidad = (id, data) => api.put(`/eventualidades/${id}`, data)
export const deleteEventualidad = (id) => api.delete(`/eventualidades/${id}`)

// Objeto unificado para usar en nuevas páginas
export const catalogosApi = {
  estilos: (p) => api.get('/estilos', { params: p }),
  tallas:  (p) => api.get('/tallas', { params: p }),
  clientes:(p) => api.get('/clientes', { params: p }),
  areas:   (p) => api.get('/areas', { params: p }),
  lineas:  (p) => api.get('/lineas-produccion', { params: p }),
  ordenes: (p) => api.get('/ordenes', { params: p }),
}
