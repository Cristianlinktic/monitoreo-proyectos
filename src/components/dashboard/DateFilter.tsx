'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

interface DateFilterProps {
  selectedDate: string
  availableDates: string[]
  onChange: (date: string) => void
}

const DAYS       = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAYS_SHORT = ['D','L','M','X','J','V','S']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function parseLocal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function DateFilter({ selectedDate, availableDates, onChange }: DateFilterProps) {
  const today    = new Date().toISOString().split('T')[0]
  const idx      = availableDates.indexOf(selectedDate)
  const hasPrev  = idx < availableDates.length - 1
  const hasNext  = idx > 0
  const isToday  = selectedDate === today
  const hasData  = availableDates.includes(selectedDate)

  const date     = parseLocal(selectedDate)
  const dayOfWeek = date.getDay()
  const dayName  = DAYS[dayOfWeek]
  const dayNum   = date.getDate()
  const month    = MONTHS[date.getMonth()]
  const year     = date.getFullYear()

  const dayRef   = useRef<HTMLSpanElement>(null)
  const prevDir  = useRef<'prev' | 'next'>('prev')

  const animateDay = (dir: 'prev' | 'next') => {
    if (!dayRef.current) return
    const fromY = dir === 'prev' ? 12 : -12
    gsap.fromTo(dayRef.current,
      { y: fromY, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
    )
  }

  const goToPrev = () => {
    prevDir.current = 'prev'
    if (hasPrev) { onChange(availableDates[idx + 1]); animateDay('prev') }
  }

  const goToNext = () => {
    prevDir.current = 'next'
    if (hasNext) { onChange(availableDates[idx - 1]); animateDay('next') }
  }

  // Hidden native input for direct date picking
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goToPrev()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <div className="flex items-center gap-3">

      {/* Navigator card */}
      <div className="relative flex items-center overflow-hidden rounded-2xl"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          boxShadow: hasData ? '0 20px 50px rgba(0,0,0,0.35), 0 0 30px rgba(124,58,237,0.12)' : '0 20px 50px rgba(0,0,0,0.35)',
        }}>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #F472C2, #7C3AED, #22D3EE, transparent)' }} />

        {/* Prev arrow */}
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          aria-label="Fecha anterior"
          className="flex items-center justify-center w-10 h-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 transition-all" style={{ color: hasPrev ? 'var(--text-muted)' : 'var(--text-faint)' }} />
        </button>

        {/* Date display — click opens native picker */}
        <button
          className="relative flex items-center gap-4 pl-1 pr-5 py-3 cursor-pointer group/date"
          onClick={() => inputRef.current?.showPicker?.()}
        >
          {/* Calendar icon badge */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(244,114,194,0.18), rgba(124,58,237,0.16))', border: '1px solid rgba(167,139,250,0.3)' }}>
            <CalendarDays className="w-4 h-4" style={{ color: '#A78BFA' }} />
          </div>

          {/* Weekday strip */}
          <div className="hidden md:flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1">
              {DAYS_SHORT.map((d, i) => (
                <span key={i} className="flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 15, height: 15, fontSize: 8,
                    background: i === dayOfWeek ? 'var(--accent-gradient)' : 'transparent',
                    color: i === dayOfWeek ? '#FFFFFF' : 'var(--text-faint)',
                  }}>
                  {d}
                </span>
              ))}
            </div>
            <span className="text-[9px] tracking-widest uppercase" style={{ color: isToday ? 'var(--accent)' : 'var(--text-faint)' }}>
              {isToday ? 'Hoy' : dayName}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-9 self-center" style={{ background: 'var(--border-soft)' }} />

          {/* Center: big day number */}
          <div className="flex flex-col items-center">
            <span
              ref={dayRef}
              className="font-heading font-bold leading-none"
              style={{
                fontSize: '2.1rem',
                background: hasData ? 'var(--accent-gradient)' : 'none',
                WebkitBackgroundClip: hasData ? 'text' : undefined,
                WebkitTextFillColor: hasData ? 'transparent' : undefined,
                backgroundClip: hasData ? 'text' : undefined,
                color: hasData ? undefined : 'var(--text-faint)',
              }}
            >
              {String(dayNum).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-wider uppercase mt-1" style={{ color: 'var(--text-faint)' }}>
              {month.slice(0, 3)} {year}
            </span>
          </div>

          {/* Hidden native input */}
          <input
            ref={inputRef}
            type="date"
            value={selectedDate}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            tabIndex={-1}
          />
        </button>

        {/* Next arrow */}
        <button
          onClick={goToNext}
          disabled={!hasNext}
          aria-label="Fecha siguiente"
          className="flex items-center justify-center w-10 h-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" style={{ color: hasNext ? 'var(--text-muted)' : 'var(--text-faint)' }} />
        </button>
      </div>

      {/* Hoy pill */}
      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="hidden sm:flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(244,114,194,0.3)',
            color: 'var(--accent)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,194,0.22)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)' }}
        >
          Hoy
        </button>
      )}
    </div>
  )
}
