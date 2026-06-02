import api from './axios'
export const login          = (data) => api.post('/auth/login', data)
export const register       = (data) => api.post('/auth/register', data)
export const logout         = ()     => api.post('/auth/logout')
export const me             = ()     => api.get('/auth/me')
export const refresh        = (refresh_token) => api.post('/auth/refresh', { refresh_token })
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword  = (data)  => api.post('/auth/reset-password', data)
export const changePassword = (data)  => api.post('/auth/change-password', data)
