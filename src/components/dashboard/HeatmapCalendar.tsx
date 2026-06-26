'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { getCoverageStats } from '@/services/monitoring.service'
import { CalendarDays } from 'lucide-react'

interface HeatmapCalendarProps {
  totalProjects: number
  onDateChange?: (date: string) => void
}

interface CellData {
  date: string
  monitored: number
  ratio: number
}

function cellColor(ratio: number): string {
  if (ratio === 0) return 'rgba(30,41,59,0.3)'
  if (ratio <= 0.33) return 'rgba(34,197,94,0.2)'
  if (ratio <= 0.66) return 'rgba(34,197,94,0.5)'
  if (ratio < 1)     return 'rgba(34,197,94,0.8)'
  return '#22C55E'
}

function cellGlow(ratio: number): string {
  if (ratio < 1) return 'none'
  return '0 0 6px rgba(34,197,94,0.7)'
}

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const DAY_LABELS  = ['L','M','X','J','V','S','D']

export function HeatmapCalendar({ totalProjects, onDateChange }: HeatmapCalendarProps) {
  const [cellMap, setCellMap] = useState<Map<string, CellData>>(new Map())
  const [tooltip, setTooltip] = useState<{ date: string; monitored: number; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    getCoverageStats().then(data => {
      const map = new Map<string, CellData>()
      data.forEach(d => {
        map.set(d.fecha, {
          date: d.fecha,
          monitored: d.monitored,
          ratio: totalProjects > 0 ? Math.min(d.monitored / totalProjects, 1) : 0,
        })
      })
      setCellMap(map)
    }).catch(console.error)
  }, [totalProjects])

  // Build grid: last 52 weeks (364 days) + partial current week
  const today = new Date()
  // Start from Sunday of the week 52 weeks ago
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 364)
  // Roll back to Monday
  const dow = startDate.getDay() // 0=Sun
  startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1))

  // Build weeks array: each week is an array of 7 date strings (Mon→Sun)
  const weeks: string[][] = []
  const cursor = new Date(startDate)
  while (cursor <= today) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      if (new Date(cursor) <= today) {
        week.push(cursor.toISOString().split('T')[0])
      } else {
        week.push('')
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // Month labels: find which column each month starts in
  const monthLabels: { col: number; label: string }[] = []
  weeks.forEach((week, col) => {
    const firstDay = week.find(d => d)
    if (!firstDay) return
    const date = new Date(firstDay)
    if (date.getDate() <= 7) {
      monthLabels.push({ col, label: MONTH_NAMES[date.getMonth()] })
    }
  })

  // Animate cells after cellMap loads
  useEffect(() => {
    if (cellMap.size === 0) return
    const cells = cellsRef.current.filter(Boolean)
    gsap.fromTo(cells,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, stagger: 0.003, ease: 'none', delay: 0.1 }
    )
  }, [cellMap])

  let cellIndex = 0

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-heading font-semibold text-[#F8FAFC]">Historial de cobertura</p>
          <p className="text-[11px] text-[#475569]">Último año de monitoreo diario</p>
        </div>
        {/* Legend */}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#475569]">
          <span>Menos</span>
          {[0, 0.25, 0.5, 0.85, 1].map(r => (
            <div key={r} className="w-2.5 h-2.5 rounded-sm" style={{ background: cellColor(r), boxShadow: cellGlow(r) }} />
          ))}
          <span>Más</span>
        </div>
      </div>

      <div ref={containerRef} className="overflow-x-auto pb-1">
        <div style={{ display: 'inline-block', minWidth: 'max-content' }}>

          {/* Month labels row */}
          <div style={{ display: 'flex', marginLeft: 20, marginBottom: 4 }}>
            {weeks.map((_, col) => {
              const label = monthLabels.find(m => m.col === col)
              return (
                <div key={col} style={{ width: 13, flexShrink: 0 }}>
                  {label && (
                    <span style={{ fontSize: 9, color: '#475569', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                      {label.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: 0 }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4, paddingTop: 1 }}>
              {DAY_LABELS.map((d, i) => (
                <div key={d} style={{ width: 12, height: 11, display: 'flex', alignItems: 'center' }}>
                  {(i === 0 || i === 2 || i === 4) && (
                    <span style={{ fontSize: 8, color: '#334155', fontFamily: 'DM Sans, sans-serif' }}>{d}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, col) => (
              <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 2 }}>
                {week.map((date, row) => {
                  const idx = cellIndex++
                  if (!date) {
                    return <div key={row} style={{ width: 11, height: 11 }} />
                  }
                  const cell = cellMap.get(date)
                  const ratio = cell?.ratio ?? 0
                  const clickable = !!cell && !!onDateChange
                  return (
                    <div
                      key={date}
                      ref={el => { cellsRef.current[idx] = el }}
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 2,
                        background: cellColor(ratio),
                        boxShadow: cellGlow(ratio),
                        cursor: clickable ? 'pointer' : 'default',
                        opacity: 0,
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      }}
                      onMouseEnter={e => {
                        if (cell) {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({ date, monitored: cell.monitored, x: rect.left, y: rect.top })
                        }
                        e.currentTarget.style.transform = 'scale(1.6)'
                        if (clickable) {
                          e.currentTarget.style.boxShadow = `0 0 10px rgba(34,197,94,0.8), 0 0 20px rgba(34,197,94,0.4)`
                          e.currentTarget.style.outline = '1px solid rgba(34,197,94,0.6)'
                        }
                      }}
                      onMouseLeave={e => {
                        setTooltip(null)
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = cellGlow(ratio)
                        e.currentTarget.style.outline = 'none'
                      }}
                      onClick={() => {
                        if (clickable) onDateChange!(date)
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 36,
            background: 'rgba(8,13,26,0.97)',
            border: '1px solid rgba(30,41,59,0.8)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            color: '#F8FAFC',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="text-[#64748B]">{tooltip.date} · </span>
          <span className="text-emerald-400 font-semibold">{tooltip.monitored}</span>
          <span className="text-[#64748B]">/{totalProjects} proyectos</span>
        </div>
      )}
    </div>
  )
}
