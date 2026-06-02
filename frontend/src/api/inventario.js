import api from './axios'

// ── Proveedores ────────────────────────────────────────────────────────────
export const proveedoresApi = {
  list:    (p) => api.get('/proveedores', { params: p }),
  get:     (id) => api.get(`/proveedores/${id}`),
  create:  (d) => api.post('/proveedores', d),
  update:  (id, d) => api.put(`/proveedores/${id}`, d),
  remove:  (id) => api.delete(`/proveedores/${id}`),
}

// ── Telas ──────────────────────────────────────────────────────────────────
export const telasApi = {
  list:         (p) => api.get('/telas', { params: p }),
  get:          (id) => api.get(`/telas/${id}`),
  create:       (d) => api.post('/telas', d),
  update:       (id, d) => api.put(`/telas/${id}`, d),
  remove:       (id) => api.delete(`/telas/${id}`),
  rollos:       (id, p) => api.get(`/telas/${id}/rollos`, { params: p }),
  addRollo:     (id, d) => api.post(`/telas/${id}/rollos`, d),
  fraccionar:   (rolloId, d) => api.post(`/rollos/${rolloId}/fraccionar`, d),
}

// ── Avíos ──────────────────────────────────────────────────────────────────
export const aviosApi = {
  list:         (p) => api.get('/avios', { params: p }),
  get:          (id) => api.get(`/avios/${id}`),
  create:       (d) => api.post('/avios', d),
  update:       (id, d) => api.put(`/avios/${id}`, d),
  remove:       (id) => api.delete(`/avios/${id}`),
  ajustarStock: (id, d) => api.post(`/avios/${id}/stock`, d),
}

// ── Movimientos de almacén ─────────────────────────────────────────────────
export const movimientosApi = {
  list: (p) => api.get('/movimientos-almacen', { params: p }),
}
