import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { toast } from '../components/ui/Toast'
import { getUsers, createUser, updateUser, deleteUser, resetUserPass } from '../api/users'
import { getEmpleados } from '../api/empleados'
import useAuthStore from '../stores/authStore'
import {
  PlusIcon, PencilIcon, TrashIcon, KeyIcon,
  BuildingOfficeIcon, CalendarDaysIcon, UserGroupIcon,
} from '@heroicons/react/24/outline'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const ROLES = [
  { value: 'admin',     label: 'Administrador' },
  { value: 'encargado', label: 'Encargado' },
  { value: 'empleado',  label: 'Empleado' },
]
const ROLE_CHIP = {
  admin:     'bg-blue-100 text-blue-700',
  encargado: 'bg-amber-100 text-amber-700',
  empleado:  'bg-emerald-100 text-emerald-700',
}

// ── Formulario usuario ────────────────────────────────────────────────────────
const EMPTY_USER = { name: '', email: '', password: '', password_confirmation: '', role: 'empleado', empleado_id: '' }

function UserModal({ open, onClose, editing, empleados, onSuccess }) {
  const [form, setForm]     = useState(EMPTY_USER)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, email: editing.email, password: '', password_confirmation: '', role: editing.role, empleado_id: editing.empleado_id ?? '' })
    } else {
      setForm(EMPTY_USER)
    }
    setErrors({})
  }, [editing, open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      const payload = { ...form }
      if (editing && !payload.password) { delete payload.password; delete payload.password_confirmation }
      if (editing) await updateUser(editing.id, payload)
      else await createUser(payload)
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado')
      onSuccess()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
      if (err.response?.data?.message) toast.error(err.response.data.message)
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar usuario' : 'Nuevo usuario'} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre completo *" value={form.name} onChange={set('name')} required error={errors.name?.[0]} />
          <Input label="Email *" type="email" value={form.email} onChange={set('email')} required error={errors.email?.[0]} />
        </div>
        <Select label="Rol *" value={form.role} onChange={set('role')} required
          options={ROLES} error={errors.role?.[0]} />
        <Select label="Empleado vinculado" value={form.empleado_id} onChange={set('empleado_id')}
          placeholder="— Sin vincular —"
          options={empleados.map(e => ({ value: e.id, label: `${e.apellidos} ${e.nombre}` }))}
          error={errors.empleado_id?.[0]} />
        {!editing && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contraseña *" type="password" value={form.password} onChange={set('password')} required error={errors.password?.[0]} />
            <Input label="Confirmar contraseña *" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
          </div>
        )}
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nueva contraseña" type="password" value={form.password} onChange={set('password')} placeholder="Dejar vacío para no cambiar" error={errors.password?.[0]} />
            <Input label="Confirmar contraseña" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal reset password ──────────────────────────────────────────────────────
function ResetPassModal({ open, onClose, user }) {
  const [form, setForm]     = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) { setForm({ password: '', password_confirmation: '' }); setErrors({}) } }, [open])

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      await resetUserPass(user.id, form)
      toast.success('Contraseña restablecida')
      onClose()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {})
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Restablecer contraseña — ${user?.name ?? ''}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Nueva contraseña *" type="password" value={form.password}
          onChange={e => setForm(f => ({...f, password: e.target.value}))} required error={errors.password?.[0]} />
        <Input label="Confirmar contraseña *" type="password" value={form.password_confirmation}
          onChange={e => setForm(f => ({...f, password_confirmation: e.target.value}))} required />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Restablecer'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Tab: Empresa ──────────────────────────────────────────────────────────────
function TabEmpresa() {
  const [empresa, setEmpresa] = useState({ nombre: '', razon_social: '', domicilio: '', telefono: '', email: '', rfc: '' })
  const [saving, setSaving]   = useState(false)

  useEffect(() => { api.get('/empresa').then(r => setEmpresa(r.data ?? {})) }, [])

  const set = (k) => (e) => setEmpresa(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await api.put('/empresa', empresa); toast.success('Datos guardados') }
    catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre *" value={empresa.nombre} onChange={set('nombre')} required />
        <Input label="Razón social" value={empresa.razon_social ?? ''} onChange={set('razon_social')} />
        <Input label="RFC" value={empresa.rfc ?? ''} onChange={set('rfc')} />
        <Input label="Teléfono" value={empresa.telefono ?? ''} onChange={set('telefono')} />
        <Input label="Email" type="email" value={empresa.email ?? ''} onChange={set('email')} />
      </div>
      <Input label="Domicilio" value={empresa.domicilio ?? ''} onChange={set('domicilio')} />
      <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
    </form>
  )
}

// ── Tab: Días laborables ──────────────────────────────────────────────────────
function TabDias() {
  const [dias, setDias] = useState([])

  useEffect(() => { api.get('/dias-laborables').then(r => setDias(r.data)) }, [])

  const toggle = async (dia) => {
    const existing = dias.find(d => d.dia_semana === dia)
    const newActivo = existing ? !existing.activo : true
    const { data } = await api.post('/dias-laborables', { dia_semana: dia, activo: newActivo })
    setDias(prev => [...prev.filter(d => d.dia_semana !== dia), data])
  }

  const updateHorario = async (dia, field, value) => {
    const existing = dias.find(d => d.dia_semana === dia)
    if (!existing) return
    try {
      const { data } = await api.put(`/dias-laborables/${existing.id}`, { [field]: value || null })
      setDias(prev => prev.map(d => d.dia_semana === dia ? data : d))
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-slate-500">Haz clic en un día para activarlo/desactivarlo. Puedes configurar el horario de entrada y salida por día.</p>
      <div className="space-y-2">
        {DIAS.map(dia => {
          const d = dias.find(x => x.dia_semana === dia)
          const activo = d?.activo ?? false
          return (
            <div key={dia} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${activo ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
              <button type="button" onClick={() => toggle(dia)}
                className={`w-28 shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${activo ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}>
                {dia}
              </button>
              {activo ? (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 w-16 shrink-0">Entrada</label>
                    <input type="time" defaultValue={d?.hora_entrada ?? ''} onBlur={e => updateHorario(dia, 'hora_entrada', e.target.value)}
                      className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 w-14 shrink-0">Salida</label>
                    <input type="time" defaultValue={d?.hora_salida ?? ''} onBlur={e => updateHorario(dia, 'hora_salida', e.target.value)}
                      className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">Día no laborable</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tab: Usuarios ─────────────────────────────────────────────────────────────
function TabUsuarios() {
  const { user: me } = useAuthStore()
  const [users, setUsers]         = useState([])
  const [empleados, setEmpleados] = useState([])
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [resetModal, setResetModal] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getUsers(); setUsers(r.data) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { getEmpleados({ per_page: 200 }).then(r => setEmpleados(r.data.data)) }, [])

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = (u) => { setEditing(u); setModal(true) }

  const handleDelete = async (u) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.name}"?`)) return
    try {
      await deleteUser(u.id)
      toast.success('Usuario eliminado')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al eliminar')
    }
  }

  const openReset = (u) => { setResetTarget(u); setResetModal(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} usuario(s)</p>
        <Button onClick={openNew}><PlusIcon className="w-4 h-4" /> Nuevo usuario</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Empleado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.id === me?.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {u.name}
                    {u.id === me?.id && <span className="ml-2 text-xs text-blue-500">(tú)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_CHIP[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.empleado ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openReset(u)} title="Restablecer contraseña"
                        className="text-slate-400 hover:text-amber-600 transition-colors">
                        <KeyIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {u.id !== me?.id && (
                        <button onClick={() => handleDelete(u)} className="text-slate-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal open={modal} onClose={() => setModal(false)} editing={editing}
        empleados={empleados} onSuccess={() => { setModal(false); load() }} />
      <ResetPassModal open={resetModal} onClose={() => setResetModal(false)}
        user={resetTarget} />
    </div>
  )
}

// ── Page principal ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'empresa', label: 'Empresa',         icon: BuildingOfficeIcon },
  { id: 'dias',    label: 'Días laborables',  icon: CalendarDaysIcon },
  { id: 'usuarios',label: 'Usuarios',         icon: UserGroupIcon },
]

export default function ConfiguracionPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('empresa')

  // Solo admin puede ver tab de usuarios
  const tabs = user?.role === 'admin' ? TABS : TABS.filter(t => t.id !== 'usuarios')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div>
        {tab === 'empresa'  && <TabEmpresa />}
        {tab === 'dias'     && <TabDias />}
        {tab === 'usuarios' && user?.role === 'admin' && <TabUsuarios />}
      </div>
    </div>
  )
}
