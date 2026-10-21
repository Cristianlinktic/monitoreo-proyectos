'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Copy, Eye, EyeOff, Loader2, ShieldOff, UserMinus, UserPlus, Users, Wand2, X,
} from 'lucide-react'
import { useAuth, useMonitoreoRol } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import {
  cambiarRol, crearMiembro, generarPassword, getMiembros, quitarAcceso,
} from '@/services/usuarios.service'
import { PASSWORD_MIN } from '@/lib/usuarios/reglas'
import { formatDateShort } from '@/lib/utils'
import type { MiembroMonitor, MonitoreoRol } from '@/lib/types'

const panelStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border)',
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-muted)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
}

const ROLES: { value: MonitoreoRol; label: string; detalle: string }[] = [
  { value: 'lector', label: 'Lector', detalle: 'Ve proyectos y monitoreo. No ve claves.' },
  { value: 'editor', label: 'Editor', detalle: 'Además crea y edita proyectos y monitoreo, y usa claves.' },
  { value: 'admin',  label: 'Admin',  detalle: 'Además borra registros, lee la auditoría y gestiona usuarios.' },
]

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
}

function NuevoUsuario({ onCreado }: { onCreado: () => void }) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<MonitoreoRol>('lector')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Se muestra una vez para que el admin la comparta por un canal seguro.
  const [entregar, setEntregar] = useState<{ email: string; password: string } | null>(null)

  const passError = password && password.length < PASSWORD_MIN
    ? `Mínimo ${PASSWORD_MIN} caracteres`
    : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const { existente } = await crearMiembro({ email, password, rol })
      if (existente) {
        toast(`${email} ya tenía cuenta: se le dio acceso con su contraseña actual.`, 'info')
        setEntregar(null)
      } else {
        toast('Usuario creado.', 'success')
        setEntregar({ email, password })
      }
      setEmail('')
      setPassword('')
      setShowPass(false)
      setRol('lector')
      onCreado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  const copiar = async () => {
    if (!entregar) return
    try {
      await navigator.clipboard.writeText(entregar.password)
      toast('Contraseña copiada.', 'success')
    } catch {
      toast('No se pudo copiar.', 'error')
    }
  }

  return (
    <div className="p-6 rounded-[20px]" style={panelStyle}>
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Dar acceso</h2>
      </div>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Si el correo ya tiene cuenta en otra app de LinkTIC, solo se le da acceso a Monitor y conserva su contraseña.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="usuario@linktic.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="off"
        />

        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Input
              label="Contraseña inicial"
              type={showPass ? 'text' : 'password'}
              placeholder={`${PASSWORD_MIN}+ caracteres`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={PASSWORD_MIN}
              autoComplete="new-password"
              error={passError}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              title={showPass ? 'Ocultar' : 'Mostrar'}
              className="absolute right-3 top-[34px] transition-colors cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setPassword(generarPassword()); setShowPass(true) }}
            className="self-start flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer"
            style={{ color: 'var(--violet)' }}
          >
            <Wand2 className="w-3 h-3" />
            Generar contraseña
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rol-nuevo" className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Rol
          </label>
          <select
            id="rol-nuevo"
            value={rol}
            onChange={e => setRol(e.target.value as MonitoreoRol)}
            className="px-3 py-2.5 rounded-[10px] text-sm focus:outline-none cursor-pointer"
            style={selectStyle}
          >
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {ROLES.find(r => r.value === rol)?.detalle}
          </p>
        </div>

        {error && (
          <div
            className="px-3 py-2.5 rounded-lg text-xs"
            style={{ color: 'var(--danger)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            {error}
          </div>
        )}

        <Button type="submit" loading={saving} className="w-full mt-1">
          {!saving && <UserPlus className="w-3.5 h-3.5" />}
          Dar acceso
        </Button>
      </form>

      {entregar && (
        <div
          className="mt-5 p-3 rounded-[14px] flex flex-col gap-2"
          style={{ background: 'var(--emerald-dim)', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Contraseña inicial de <span className="font-semibold" style={{ color: 'var(--text)' }}>{entregar.email}</span>.
              Compártela por un canal seguro; no se vuelve a mostrar.
            </p>
            <button type="button" onClick={() => setEntregar(null)} title="Cerrar" className="cursor-pointer shrink-0" style={{ color: 'var(--text-faint)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate px-2 py-1.5 rounded-lg text-xs font-mono" style={{ background: 'rgba(0,0,0,0.28)', color: 'var(--text)' }}>
              {entregar.password}
            </code>
            <Button type="button" variant="secondary" size="sm" onClick={copiar}>
              <Copy className="w-3 h-3" />
              Copiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilaMiembro({ miembro, esYo, onCambio }: { miembro: MiembroMonitor; esYo: boolean; onCambio: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const nombre = miembro.email ?? 'Cuenta sin correo'

  const handleRol = async (rol: MonitoreoRol) => {
    setSaving(true)
    try {
      await cambiarRol(miembro.user_id, rol)
      toast(`Rol de ${nombre} actualizado.`, 'success')
      onCambio()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'No se pudo cambiar el rol.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleQuitar = async () => {
    setSaving(true)
    try {
      await quitarAcceso(miembro.user_id)
      toast(`${nombre} ya no tiene acceso a Monitor.`, 'success')
      onCambio()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'No se pudo quitar el acceso.', 'error')
      setSaving(false)
      setConfirmando(false)
    }
  }

  return (
    <li
      className="flex flex-wrap items-center gap-3 p-4 rounded-[14px]"
      style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-soft)' }}
    >
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{nombre}</p>
          {esYo && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0"
              style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: 'var(--violet)' }}>
              TÚ
            </span>
          )}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          Desde {formatDateShort(miembro.created_at)}
        </p>
      </div>

      <select
        aria-label={`Rol de ${nombre}`}
        value={miembro.rol}
        disabled={saving}
        onChange={e => handleRol(e.target.value as MonitoreoRol)}
        className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer disabled:opacity-40"
        style={selectStyle}
      >
        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {confirmando ? (
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" loading={saving} onClick={handleQuitar}>
            Quitar acceso
          </Button>
          <Button variant="ghost" size="sm" disabled={saving} onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" disabled={saving} onClick={() => setConfirmando(true)} title="Quitar acceso a Monitor">
          <UserMinus className="w-3.5 h-3.5" />
        </Button>
      )}
    </li>
  )
}

function UsuariosContent() {
  const router = useRouter()
  const [miembros, setMiembros] = useState<MiembroMonitor[]>([])
  const [yo, setYo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    getMiembros()
      .then(({ miembros, yo }) => { setMiembros(miembros); setYo(yo); setError(null) })
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar la lista.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const orden: Record<MonitoreoRol, number> = { admin: 0, editor: 1, lector: 2 }
  const lista = [...miembros].sort((a, b) =>
    orden[a.rol] - orden[b.rol] || (a.email ?? '').localeCompare(b.email ?? ''))

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="aurora-blobs">
        <div className="aurora-blob aurora-blob-magenta" />
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-cyan" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6" style={{ zIndex: 1 }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al dashboard
          </button>
        </div>

        <div className="mb-5">
          <h1 className="text-2xl leading-tight mb-1.5" style={{ color: 'var(--text)' }}>Usuarios</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Quién entra a Monitor y con qué rol. Quitar el acceso no borra la cuenta: puede seguir usando las otras apps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
          <div className="p-6 rounded-[20px]" style={panelStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Miembros</h2>
              {!loading && !error && (
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-faint)' }}>{miembros.length}</span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
                <Button variant="secondary" size="sm" onClick={cargar}>Reintentar</Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {lista.map(m => (
                  <FilaMiembro key={m.user_id} miembro={m} esYo={m.user_id === yo} onCambio={cargar} />
                ))}
              </ul>
            )}
          </div>

          <NuevoUsuario onCreado={cargar} />
        </div>
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { rol, loading: rolLoading } = useMonitoreoRol(user?.id)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || (user && rolLoading)) return <Spinner />
  if (!user) return null

  // Solo es la vista: las rutas /api/usuarios vuelven a comprobar el rol en la base.
  if (rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-sm text-center flex flex-col items-center gap-3">
          <ShieldOff className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Solo para administradores</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            La gestión de usuarios requiere el rol admin en Monitor.
          </p>
          <button onClick={() => router.push('/')} className="mt-2 text-xs underline cursor-pointer" style={{ color: 'var(--accent)' }}>
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <UsuariosContent />
    </ToastProvider>
  )
}
