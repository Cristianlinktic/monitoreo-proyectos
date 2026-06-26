'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Radio, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const ADMIN_CODE = 'linktic2026'

export default function LoginPage() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'login' | 'code' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/')
    })
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { y: 24, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      )
    }
  }, [router])

  const switchMode = (next: 'login' | 'code' | 'register') => {
    setMode(next)
    setError(null)
    setSuccess(null)
    setCodeError(false)
    setAdminCode('')
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminCode === ADMIN_CODE) {
      setCodeError(false)
      setMode('register')
      setAdminCode('')
    } else {
      setCodeError(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        const { error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) {
          setError(authError.message)
        } else {
          setSuccess('Cuenta creada correctamente.')
          setEmail('')
          setPassword('')
          switchMode('login')
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
          setError(authError.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos'
            : authError.message)
        } else {
          router.replace('/')
        }
      }
    } catch {
      setError('Error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 rounded-full blur-3xl opacity-[0.05]" style={{ background: '#22C55E' }} />
        <div className="absolute w-64 h-64 bottom-0 right-0 rounded-full blur-3xl opacity-[0.04]" style={{ background: '#06B6D4' }} />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(30,41,59,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div ref={cardRef} className="relative w-full max-w-sm">
        <div className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #22C55E, #06B6D4, transparent)' }} />

        <div className="rounded-b-2xl rounded-tr-2xl p-8"
          style={{ background: 'rgba(8,13,26,0.97)', border: '1px solid rgba(30,41,59,0.8)', borderTop: 'none', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.08))', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 0 24px rgba(34,197,94,0.15)' }}>
              <Radio className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-center">
              <h1 className="font-bold text-lg text-gradient leading-none">Monitor MKT</h1>
              <p className="text-[11px] tracking-widest uppercase mt-1" style={{ color: '#334155' }}>LinkTIC · Acceso</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
            <button type="button" onClick={() => switchMode('login')}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={mode === 'login' ? {
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.06))',
                border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E',
              } : { border: '1px solid transparent', color: '#475569' }}>
              Iniciar sesión
            </button>
            <button type="button" onClick={() => switchMode(mode === 'login' ? 'code' : 'login')}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={mode !== 'login' ? {
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.06))',
                border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E',
              } : { border: '1px solid transparent', color: '#475569' }}>
              Crear cuenta
            </button>
          </div>

          {/* Code gate */}
          {mode === 'code' && (
            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="p-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                </div>
                <p className="text-xs text-center" style={{ color: '#475569' }}>
                  Ingresa el código de administrador para continuar
                </p>
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Código de administrador"
                  value={adminCode}
                  onChange={e => { setAdminCode(e.target.value); setCodeError(false) }}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
                  style={{
                    background: 'rgba(3,7,18,0.8)',
                    border: `1px solid ${codeError ? 'rgba(239,68,68,0.5)' : 'rgba(30,41,59,0.7)'}`,
                  }}
                  onFocus={e => { if (!codeError) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onBlur={e => { if (!codeError) e.currentTarget.style.borderColor = 'rgba(30,41,59,0.7)' }}
                />
                {codeError && (
                  <p className="text-[11px] text-red-400 mt-1.5">Código incorrecto</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Verificar
              </Button>
            </form>
          )}

          {/* Register / Login form */}
          {(mode === 'login' || mode === 'register') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="usuario@linktic.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 bottom-2.5 text-[#334155] hover:text-[#94A3B8] transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg text-xs text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="px-3 py-2.5 rounded-lg text-xs text-emerald-400"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {success}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full mt-1">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
