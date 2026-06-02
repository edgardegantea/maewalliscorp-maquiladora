import api from './axios'

// ── Artículos / SKU ────────────────────────────────────────────────────────
export const articulosApi = {
  list:             (p) => api.get('/articulos', { params: p }),
  get:              (id) => api.get(`/articulos/${id}`),
  create:           (d) => api.post('/articulos', d),
  update:           (id, d) => api.put(`/articulos/${id}`, d),
  remove:           (id) => api.delete(`/articulos/${id}`),
  generarVariantes: (d) => api.post('/articulos/generar-variantes', d),
}

// ── Talleres externos ──────────────────────────────────────────────────────
export const talleresApi = {
  list:         (p) => api.get('/talleres', { params: p }),
  get:          (id) => api.get(`/talleres/${id}`),
  create:       (d) => api.post('/talleres', d),
  update:       (id, d) => api.put(`/talleres/${id}`, d),
  remove:       (id) => api.delete(`/talleres/${id}`),
}

export const enviosTallerApi = {
  list:   (p) => api.get('/envios-taller', { params: p }),
  create: (d) => api.post('/envios-taller', d),
  update: (id, d) => api.put(`/envios-taller/${id}`, d),
}

// ── Listas de precios ──────────────────────────────────────────────────────
export const listasApi = {
  list:          (p) => api.get('/listas-precios', { params: p }),
  get:           (id) => api.get(`/listas-precios/${id}`),
  create:        (d) => api.post('/listas-precios', d),
  update:        (id, d) => api.put(`/listas-precios/${id}`, d),
  remove:        (id) => api.delete(`/listas-precios/${id}`),
  syncArticulos: (id, d) => api.post(`/listas-precios/${id}/articulos`, d),
}

// ── Cuentas por pagar ──────────────────────────────────────────────────────
export const cuentasPagarApi = {
  list:          (p) => api.get('/cuentas-pagar', { params: p }),
  get:           (id) => api.get(`/cuentas-pagar/${id}`),
  create:        (d) => api.post('/cuentas-pagar', d),
  update:        (id, d) => api.put(`/cuentas-pagar/${id}`, d),
  remove:        (id) => api.delete(`/cuentas-pagar/${id}`),
  registrarPago: (id, d) => api.post(`/cuentas-pagar/${id}/pago`, d),
}

// ── BOM ────────────────────────────────────────────────────────────────────
export const bomApi = {
  porEstilo: (estiloId) => api.get(`/estilos/${estiloId}/bom`),
  create:    (d) => api.post('/bom', d),
  update:    (id, d) => api.put(`/bom/${id}`, d),
  remove:    (id) => api.delete(`/bom/${id}`),
}

// ── Curva de tallas ────────────────────────────────────────────────────────
export const curvaTallasApi = {
  get:  (ordenId) => api.get(`/ordenes/${ordenId}/curva-tallas`),
  sync: (ordenId, curva) => api.post(`/ordenes/${ordenId}/curva-tallas`, { curva }),
}
