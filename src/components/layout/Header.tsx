'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Plus, Upload, Radio, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  onNewProject: () => void
  onImport: () => void
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  if (!time) return null
  return (
    <span className="font-mono text-[11px] tracking-widest tabular-nums" style={{ color: '#A78BFA' }}>
      {time}
    </span>
  )
}

export function Header({ onNewProject, onImport }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const headerRef  = useRef<HTMLElement>(null)
  const scanRef    = useRef<HTMLDivElement>(null)
  const ring1Ref   = useRef<HTMLDivElement>(null)
  const ring2Ref   = useRef<HTMLDivElement>(null)
  const logoRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Header slide in
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      )
    }

    // Scanning line — loops across the full header width
    if (scanRef.current) {
      gsap.fromTo(scanRef.current,
        { x: '-100%', opacity: 0.8 },
        { x: '120%', opacity: 0, duration: 3.5, ease: 'none', repeat: -1, repeatDelay: 5 }
      )
    }

    // Concentric rings on the logo icon
    if (ring1Ref.current) {
      gsap.to(ring1Ref.current, {
        scale: 1.8, opacity: 0, duration: 1.8,
        repeat: -1, ease: 'power2.out', transformOrigin: 'center',
      })
    }
    if (ring2Ref.current) {
      gsap.to(ring2Ref.current, {
        scale: 1.8, opacity: 0, duration: 1.8,
        repeat: -1, ease: 'power2.out', delay: 0.9, transformOrigin: 'center',
      })
    }

    // Logo subtle pulse
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        boxShadow: '0 0 28px rgba(244,114,194,0.55), 0 0 56px rgba(244,114,194,0.18)',
        duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 opacity-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20,12,34,0.92) 0%, rgba(11,7,19,0.88) 100%)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Top gradient accent */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(244,114,194,0.6) 25%, rgba(124,58,237,0.8) 50%, rgba(34,211,238,0.6) 75%, transparent 100%)' }}
      />

      {/* Scanning sweep line */}
      <div ref={scanRef} className="absolute top-0 bottom-0 w-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(244,114,194,0.06), rgba(244,114,194,0.12), rgba(244,114,194,0.06), transparent)',
          left: 0,
        }}
      />

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            {/* Pulse rings */}
            <div ref={ring1Ref} className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: '1px solid rgba(244,114,194,0.5)', opacity: 0.5 }}
            />
            <div ref={ring2Ref} className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: '1px solid rgba(124,58,237,0.4)', opacity: 0.3 }}
            />
            {/* Icon */}
            <div
              ref={logoRef}
              className="relative z-10 p-2.5 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--accent-gradient)',
                border: '1px solid rgba(244,114,194,0.4)',
              }}
            >
              <Radio className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span
                className="font-heading font-bold text-sm leading-none"
                style={{
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Monitor MKT
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}>
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>
                LinkTIC
              </span>
              <div className="h-px flex-1 w-8" style={{ background: 'var(--border-soft)' }} />
              <LiveClock />
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            className="p-2 rounded-xl transition-all cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.35)'
              ;(e.currentTarget as HTMLElement).style.color = '#F59E0B'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'
            }}
          >
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Import */}
          <button
            onClick={onImport}
            className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-faint)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.35)'
              ;(e.currentTarget as HTMLElement).style.color = '#22D3EE'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(34,211,238,0.12)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>

          {/* User + sign out */}
          {user && (
            <div className="hidden md:flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid var(--border-soft)' }}>
              <span className="text-[10px] max-w-28 truncate" style={{ color: 'var(--text-faint)' }}>{user.email}</span>
              <button
                onClick={signOut}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg transition-all cursor-pointer"
                style={{ border: '1px solid var(--border-soft)', color: 'var(--text-faint)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--danger)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* New project */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 0 20px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              color: '#FFFFFF',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(244,114,194,0.55), 0 2px 8px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Bottom inner glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(244,114,194,0.14), rgba(124,58,237,0.1), transparent)' }}
      />
    </header>
  )
}
