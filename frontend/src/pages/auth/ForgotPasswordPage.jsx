import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import { EnvelopeIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Maquiladora</h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema de Administración de Producción</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl">

          {/* Estado: enviado */}
          {sent ? (
            <div className="text-center space-y-4 py-2">
              <div className="flex justify-center">
                <CheckCircleIcon className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="font-bold text-slate-800 text-lg">Revisa tu correo</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Si <strong>{email}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña.
                Revisa también tu carpeta de spam.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* Estado: formulario */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">Recuperar contraseña</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa tu correo y te enviaremos un enlace para restablecerla.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
