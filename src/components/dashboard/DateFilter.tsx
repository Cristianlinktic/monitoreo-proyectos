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
          background: 'rgba(5,10,20,0.9)',
          border: '1px solid rgba(30,41,59,0.8)',
          boxShadow: hasData ? '0 0 24px rgba(34,197,94,0.06)' : 'none',
        }}>

        {/* Prev arrow */}
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          aria-label="Fecha anterior"
          className="h-full px-3 py-3 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed group"
          style={{ borderRight: '1px solid rgba(30,41,59,0.6)' }}
        >
          <ChevronLeft className="w-4 h-4 transition-all"
            style={{ color: hasPrev ? '#475569' : '#1E293B' }}
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
              style={{ color: isToday ? '#22C55E' : '#94A3B8' }}>
              {isToday ? 'HOY' : dayName}
            </span>
            <span className="text-[10px] tracking-wider uppercase" style={{ color: '#64748B' }}>
              {month.slice(0, 3)} {year}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 self-center" style={{ background: 'rgba(30,41,59,0.6)' }} />

          {/* Center: big day number */}
          <div className="flex flex-col items-center">
            <span
              ref={dayRef}
              className="font-heading font-bold leading-none"
              style={{
                fontSize: '2rem',
                color: hasData ? '#F8FAFC' : '#334155',
                textShadow: hasData ? '0 0 24px rgba(34,197,94,0.2)' : 'none',
              }}
            >
              {String(dayNum).padStart(2, '0')}
            </span>
            {/* Data indicator dots */}
            <div className="flex gap-0.5 mt-1">
              {hasData ? (
                <div className="w-1 h-1 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 4px rgba(34,197,94,0.8)' }} />
              ) : (
                <div className="w-1 h-1 rounded-full bg-[#1E293B]" />
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
          style={{ borderLeft: '1px solid rgba(30,41,59,0.6)' }}
        >
          <ChevronRight className="w-4 h-4"
            style={{ color: hasNext ? '#475569' : '#1E293B' }}
          />
        </button>
      </div>

      {/* Hoy pill */}
      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer active:scale-95"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#22C55E',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.15)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.08)' }}
        >
          Hoy
        </button>
      )}
    </div>
  )
}
