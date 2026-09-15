'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ArrowRight, Eye, EyeOff, Radio, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RevealLines } from '@/components/motion/RevealLines'
import { GooeyBlobField } from '@/components/login/GooeyBlobField'

const ADMIN_CODE = 'linktic2026'

export default function LoginPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
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

    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(cardRef.current,
        { y: 24, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6 }
      )
      tl.fromTo('[data-stagger]',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
        '-=0.3'
      )
    }, containerRef)
    return () => ctx.revert()
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
    <div ref={containerRef} className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg)' }}>
      <GooeyBlobField />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-14 lg:gap-10 xl:gap-16 w-full max-w-[1600px] mx-auto px-6 lg:pl-10 lg:pr-16 xl:pr-24 py-16">

        {/* Wordmark */}
        <div className="w-full lg:flex-1 lg:-ml-2 xl:-ml-4 pointer-events-none select-none text-center lg:text-left">
          <RevealLines
            as="h1"
            lines={['MONI', 'TOR']}
            className="font-extrabold text-white leading-[0.86] tracking-[-0.03em] -rotate-3 inline-block lg:block origin-center lg:origin-left [text-shadow:0_0_60px_rgba(236,72,201,0.35)] text-[clamp(3.5rem,9vw,10.5rem)]"
            delay={0.15}
          />
          <p data-stagger className="mt-7 lg:mt-8 text-[11px] tracking-[0.28em] uppercase" style={{ color: 'var(--text-muted)' }}>
            LinkTIC · Equipo Marketing
          </p>
          <p data-stagger className="mt-2 text-sm max-w-sm mx-auto lg:mx-0" style={{ color: 'var(--text-muted)' }}>
            Monitoreo diario de proyectos web — SSL, rendimiento, estabilidad y backups.
          </p>
        </div>

        {/* Access card */}
        <div ref={cardRef} className="relative w-full max-w-md lg:flex-shrink-0">
          <div
            className="relative overflow-hidden rounded-[24px] p-8 sm:p-10"
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--border)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 90px rgba(192,38,211,0.18)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'var(--accent-gradient)' }} />

            {/* Brand row */}
            <div data-stagger className="flex items-center gap-2.5 mb-7">
              <div className="relative w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-gradient)' }}>
                <Radio className="w-4 h-4 text-white" strokeWidth={2} />
                <span
                  className="login-live-dot absolute -top-0.5 -right-0.5"
                  style={{ background: 'var(--cyan)', boxShadow: '0 0 8px rgba(34,211,238,0.9)' }}
                />
              </div>
              <p className="font-semibold text-[13px] text-white">
                Acceso equipo
              </p>
            </div>

            {/* Tabs */}
            <div data-stagger className="relative flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
              <div
                className="absolute top-1 bottom-1 rounded-lg transition-transform"
                style={{
                  left: '4px',
                  width: 'calc(50% - 6px)',
                  background: 'var(--accent-gradient)',
                  transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
                  transitionDuration: '350ms',
                  transitionTimingFunction: 'var(--ease-spring-hover)',
                }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="relative z-10 flex-1 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{ color: mode === 'login' ? '#FFFFFF' : 'var(--text-faint)' }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'code' : 'login')}
                className="relative z-10 flex-1 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{ color: mode !== 'login' ? '#FFFFFF' : 'var(--text-faint)' }}
              >
                Crear cuenta
              </button>
            </div>

            {/* Code gate */}
            {mode === 'code' && (
              <form data-stagger onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="p-2 rounded-xl" style={{ background: 'var(--violet-dim)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: 'var(--violet)' }} />
                  </div>
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    Ingresa el código de administrador para continuar
                  </p>
                </div>

                <Input
                  type="password"
                  placeholder="Código de administrador"
                  value={adminCode}
                  onChange={e => { setAdminCode(e.target.value); setCodeError(false) }}
                  autoFocus
                  error={codeError ? 'Código incorrecto' : undefined}
                />

                <Button type="submit" className="w-full">
                  Verificar
                </Button>
              </form>
            )}

            {/* Login / Register form */}
            {(mode === 'login' || mode === 'register') && (
              <form data-stagger onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    className="absolute right-3 bottom-2.5 transition-colors cursor-pointer"
                    style={{ color: 'var(--text-faint)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <div
                    className="px-3 py-2.5 rounded-lg text-xs"
                    style={{ color: 'var(--danger)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="px-3 py-2.5 rounded-lg text-xs"
                    style={{ color: 'var(--emerald)', background: 'var(--emerald-dim)', border: '1px solid rgba(52,211,153,0.2)' }}
                  >
                    {success}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full mt-1">
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <p className="relative z-10 text-center text-[10px] tracking-widest uppercase pb-8" style={{ color: 'var(--text-faint)' }}>
        LinkTIC © {new Date().getFullYear()} · Uso interno
      </p>
    </div>
  )
}
