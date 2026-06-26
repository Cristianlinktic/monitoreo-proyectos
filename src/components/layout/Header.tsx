'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Zap, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DateFilter } from '@/components/dashboard/DateFilter'

interface HeaderProps {
  selectedDate: string
  availableDates: string[]
  onDateChange: (date: string) => void
  onNewProject: () => void
  onImport: () => void
}

export function Header({ selectedDate, availableDates, onDateChange, onNewProject, onImport }: HeaderProps) {
  const logoRef  = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        boxShadow: '0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.2)',
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    }
  }, [])

  return (
    <header ref={headerRef} className="sticky top-0 z-40 opacity-0"
      style={{ borderBottom: '1px solid rgba(30,41,59,0.8)', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)' }}>

      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #22C55E, #06B6D4, transparent)' }} />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div ref={logoRef} className="relative p-2 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="hidden sm:block">
            <p className="font-heading font-bold text-sm leading-none text-gradient">
              Monitor MKT
            </p>
            <p className="text-[10px] text-[#334155] leading-none mt-0.5 tracking-widest uppercase">
              LinkTIC Projects
            </p>
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center">
          <DateFilter selectedDate={selectedDate} availableDates={availableDates} onChange={onDateChange} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
            style={{ border: '1px solid #1E293B', background: 'rgba(15,23,42,0.5)' }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#020617] transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              boxShadow: '0 0 16px rgba(34,197,94,0.3)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>
    </header>
  )
}
