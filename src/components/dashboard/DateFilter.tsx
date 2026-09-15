'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateFilterProps {
  selectedDate: string
  availableDates: string[]
  onChange: (date: string) => void
}

const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
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
  const dayName  = DAYS[date.getDay()]
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

      {/* Navigator */}
      <div className="relative flex items-center rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          boxShadow: hasData ? '0 0 24px rgba(244,114,194,0.08)' : 'none',
        }}>

        {/* Prev arrow */}
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          aria-label="Fecha anterior"
          className="h-full px-3 py-3 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed group"
          style={{ borderRight: '1px solid var(--border-soft)' }}
        >
          <ChevronLeft className="w-4 h-4 transition-all"
            style={{ color: hasPrev ? 'var(--text-muted)' : 'var(--text-faint)' }}
          />
        </button>

        {/* Date display — click opens native picker */}
        <button
          className="relative flex items-center gap-4 px-5 py-2.5 cursor-pointer group/date"
          onClick={() => inputRef.current?.showPicker?.()}
        >
          {/* Left: day-of-week + month */}
          <div className="flex flex-col items-end gap-0 hidden sm:flex">
            <span className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>
              {isToday ? 'HOY' : dayName}
            </span>
            <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-faint)' }}>
              {month.slice(0, 3)} {year}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 self-center" style={{ background: 'var(--border-soft)' }} />

          {/* Center: big day number */}
          <div className="flex flex-col items-center">
            <span
              ref={dayRef}
              className="font-heading font-bold leading-none"
              style={{
                fontSize: '2rem',
                color: hasData ? 'var(--text)' : 'var(--text-faint)',
                textShadow: hasData ? '0 0 24px rgba(244,114,194,0.25)' : 'none',
              }}
            >
              {String(dayNum).padStart(2, '0')}
            </span>
            {/* Data indicator dots */}
            <div className="flex gap-0.5 mt-1">
              {hasData ? (
                <div className="w-1 h-1 rounded-full" style={{ background: '#34D399', boxShadow: '0 0 4px rgba(52,211,153,0.8)' }} />
              ) : (
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              )}
            </div>
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
          className="h-full px-3 py-3 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ borderLeft: '1px solid var(--border-soft)' }}
        >
          <ChevronRight className="w-4 h-4"
            style={{ color: hasNext ? 'var(--text-muted)' : 'var(--text-faint)' }}
          />
        </button>
      </div>

      {/* Hoy pill */}
      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer active:scale-95"
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
