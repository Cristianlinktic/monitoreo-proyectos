'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { getLastMonitoringDates } from '@/services/monitoring.service'
import type { ProjectWithMonitoring } from '@/lib/types'

interface StaleProjectsProps {
  projects: ProjectWithMonitoring[]
}

function daysSince(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateStr.split('-').map(Number)
  const last = new Date(y, m - 1, d)
  return Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}

type Level = 'never' | 'critical' | 'warning'

const LEVEL_COLOR: Record<Level, string> = {
  never:    '#64748B',
  critical: '#EF4444',
  warning:  '#F59E0B',
}
const LEVEL_LABEL: Record<Level, (days: number) => string> = {
  never:    () => 'Nunca',
  critical: (d) => `Hace ${d} día${d !== 1 ? 's' : ''}`,
  warning:  (d) => `Hace ${d} día${d !== 1 ? 's' : ''}`,
}

export function StaleProjects({ projects }: StaleProjectsProps) {
  const [lastDates, setLastDates] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getLastMonitoringDates()
      .then(d => {
        setLastDates(d)
        setLoaded(true)
        // Auto-expand if there are urgent projects
        const hasUrgent = projects.some(p => {
          const last = d[p.id]
          if (!last) return true
          return daysSince(last) >= 30
        })
        if (hasUrgent) setOpen(true)
      })
      .catch(() => setLoaded(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stale = projects
    .map(p => {
      const last = lastDates[p.id]
      if (!last) return { project: p, days: -1, level: 'never' as Level }
      const days = daysSince(last)
      if (days >= 30) return { project: p, days, level: 'critical' as Level }
      if (days >= 7)  return { project: p, days, level: 'warning'  as Level }
      return null
    })
    .filter(Boolean) as { project: ProjectWithMonitoring; days: number; level: Level }[]

  if (!loaded || stale.length === 0) return null

  const worstColor = stale.find(s => s.level === 'critical' || s.level === 'never')
    ? LEVEL_COLOR[stale.find(s => s.level === 'critical') ? 'critical' : 'never']
    : LEVEL_COLOR.warning

  const handleToggle = () => {
    setOpen(o => {
      const next = !o
      if (listRef.current) {
        if (next) {
          gsap.fromTo(listRef.current,
            { height: 0, opacity: 0 },
            { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
          )
        } else {
          gsap.to(listRef.current, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' })
        }
      }
      return next
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>

      <div className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${worstColor}60, transparent)` }} />

      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: 'rgba(5,10,20,0.6)' }}
      >
        <div className="p-1.5 rounded-lg" style={{ background: `${worstColor}15`, border: `1px solid ${worstColor}30` }}>
          <Clock className="w-3.5 h-3.5" style={{ color: worstColor }} />
        </div>
        <span className="font-semibold text-sm text-[#F8FAFC] flex-1 text-left">
          Proyectos sin revisar
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${worstColor}20`, color: worstColor, border: `1px solid ${worstColor}40` }}>
            {stale.length}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-[#475569]" />
            : <ChevronDown className="w-4 h-4 text-[#475569]" />}
        </div>
      </button>

      <div ref={listRef} style={{ overflow: 'hidden', height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}>
        <div className="px-4 pb-4 flex flex-col gap-2 pt-1">
          {stale.map(({ project, days, level }) => {
            const color = LEVEL_COLOR[level]
            return (
              <div key={project.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F8FAFC] truncate">{project.nombre}</p>
                  {project.maquetador && (
                    <p className="text-[11px] text-[#475569]">{project.maquetador}</p>
                  )}
                </div>
                <span className="text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-lg"
                  style={{ background: `${color}15`, color }}>
                  {LEVEL_LABEL[level](days)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
