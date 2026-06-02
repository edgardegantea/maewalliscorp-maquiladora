import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'
import { setAccessToken, clearAccessToken } from '../api/axios'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authChecked: false,

      // Verificar token al arrancar la app
      initAuth: async () => {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) {
          set({ user: null, isAuthenticated: false, authChecked: true })
          return
        }
        try {
          // Intentar refrescar para obtener un access token en memoria
          const { data } = await authApi.refresh(refresh)
          setAccessToken(data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          const me = await authApi.me()
          set({ user: me.data, isAuthenticated: true, authChecked: true })
        } catch {
          clearAccessToken()
          localStorage.removeItem('refresh_token')
          set({ user: null, isAuthenticated: false, authChecked: true })
        }
      },

      login: async (credentials) => {
        const { data } = await authApi.login(credentials)
        setAccessToken(data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        set({ user: data.user, isAuthenticated: true, authChecked: true })
        return data
      },

      logout: async () => {
        try { await authApi.logout() } catch {}
        clearAccessToken()
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, authChecked: true })
      },

      setUser: (user) => set({ user, isAuthenticated: !!user, authChecked: true }),
    }),
    {
      name: 'maquiladora-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      // authChecked NO se persiste: siempre empieza en false y se recalcula
    }
  )
)

export default useAuthStore
