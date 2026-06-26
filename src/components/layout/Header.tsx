'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Plus, Upload, Radio } from 'lucide-react'
import { DateFilter } from '@/components/dashboard/DateFilter'

interface HeaderProps {
  selectedDate: string
  availableDates: string[]
  onDateChange: (date: string) => void
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
    <span className="font-mono text-[11px] tracking-widest tabular-nums" style={{ color: '#22C55E' }}>
      {time}
    </span>
  )
}

export function Header({ selectedDate, availableDates, onDateChange, onNewProject, onImport }: HeaderProps) {
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
        boxShadow: '0 0 28px rgba(34,197,94,0.55), 0 0 56px rgba(34,197,94,0.18)',
        duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 opacity-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(3,7,18,0.98) 0%, rgba(2,6,23,0.92) 100%)',
        borderBottom: '1px solid rgba(30,41,59,0.6)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Top gradient accent */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.6) 25%, rgba(6,182,212,0.8) 50%, rgba(139,92,246,0.6) 75%, transparent 100%)' }}
      />

      {/* Scanning sweep line */}
      <div ref={scanRef} className="absolute top-0 bottom-0 w-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.06), rgba(34,197,94,0.12), rgba(34,197,94,0.06), transparent)',
          left: 0,
        }}
      />

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(30,41,59,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            {/* Pulse rings */}
            <div ref={ring1Ref} className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: '1px solid rgba(34,197,94,0.5)', opacity: 0.5 }}
            />
            <div ref={ring2Ref} className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: '1px solid rgba(34,197,94,0.3)', opacity: 0.3 }}
            />
            {/* Icon */}
            <div
              ref={logoRef}
              className="relative z-10 p-2.5 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.08))',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-sm leading-none text-gradient">
                Monitor MKT
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-widest uppercase" style={{ color: '#94A3B8' }}>
                LinkTIC
              </span>
              <div className="h-px flex-1 w-8" style={{ background: 'rgba(30,41,59,0.6)' }} />
              <LiveClock />
            </div>
          </div>
        </div>

        {/* Center: Date navigator */}
        <div className="flex-1 flex justify-center">
          <DateFilter
            selectedDate={selectedDate}
            availableDates={availableDates}
            onChange={onDateChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Import */}
          <button
            onClick={onImport}
            className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
            style={{
              background: 'rgba(8,13,26,0.8)',
              border: '1px solid rgba(30,41,59,0.7)',
              color: '#475569',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.3)'
              ;(e.currentTarget as HTMLElement).style.color = '#06B6D4'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(6,182,212,0.1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.7)'
              ;(e.currentTarget as HTMLElement).style.color = '#475569'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>

          {/* New project */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              boxShadow: '0 0 20px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              color: '#020617',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(34,197,94,0.55), 0 2px 8px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Bottom inner glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.12), rgba(6,182,212,0.08), transparent)' }}
      />
    </header>
  )
}
