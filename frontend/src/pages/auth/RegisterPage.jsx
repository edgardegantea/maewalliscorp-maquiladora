import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import * as authApi from '../../api/auth'

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre_empresa: '', name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error al registrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Maquiladora</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="font-semibold text-slate-800 text-lg">Registrar empresa</h2>
          <Input label="Nombre de la empresa" value={form.nombre_empresa} onChange={set('nombre_empresa')} required />
          <Input label="Tu nombre" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required />
          <Input label="Confirmar contraseña" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </Button>
          <p className="text-center text-xs text-slate-500">
            ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:underline">Ingresar</a>
          </p>
        </form>
      </div>
    </div>
  )
}
