import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import { LockClosedIcon, ChevronLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

function PasswordInput({ label, value, onChange, required }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={8}
          className="w-full border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
        >
          {show ? 'Ocultar' : 'Ver'}
        </button>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const token                 = searchParams.get('token') ?? ''
  const email                 = searchParams.get('email') ?? ''

  const [password, setPassword]     = useState('')
  const [confirm,  setConfirm]      = useState('')
  const [loading,  setLoading]      = useState(false)
  const [success,  setSuccess]      = useState(false)
  const [error,    setError]        = useState('')

  // Token o email ausentes → mostrar error inmediato
  const invalidLink = !token || !email

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirm,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Ocurrió un error. El enlace puede haber expirado.')
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

          {/* Enlace inválido */}
          {invalidLink && (
            <div className="text-center space-y-4 py-2">
              <ExclamationCircleIcon className="w-14 h-14 text-red-400 mx-auto" />
              <h2 className="font-bold text-slate-800 text-lg">Enlace inválido</h2>
              <p className="text-sm text-slate-500">
                Este enlace de recuperación es inválido o está incompleto.
                Solicita uno nuevo desde la página de recuperación.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-700"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          )}

          {/* Éxito */}
          {!invalidLink && success && (
            <div className="text-center space-y-4 py-2">
              <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto" />
              <h2 className="font-bold text-slate-800 text-lg">¡Contraseña actualizada!</h2>
              <p className="text-sm text-slate-500">
                Tu contraseña fue restablecida correctamente.
                Serás redirigido al inicio de sesión en unos segundos…
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Ir ahora al inicio de sesión
              </Link>
            </div>
          )}

          {/* Formulario */}
          {!invalidLink && !success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">Nueva contraseña</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cuenta: <strong className="text-slate-600">{email}</strong>
                </p>
              </div>

              <PasswordInput
                label="Nueva contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <PasswordInput
                label="Confirmar contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />

              {/* Indicador de fortaleza */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        password.length < 8  ? 'w-1/4 bg-red-400'    :
                        password.length < 12 ? 'w-2/4 bg-yellow-400' :
                                               'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <p className={`text-xs ${
                    password.length < 8  ? 'text-red-500'    :
                    password.length < 12 ? 'text-yellow-600' :
                                           'text-green-600'
                  }`}>
                    {password.length < 8  ? 'Demasiado corta (mínimo 8 caracteres)' :
                     password.length < 12 ? 'Contraseña aceptable'                  :
                                            'Contraseña segura'}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Guardando…' : 'Restablecer contraseña'}
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
