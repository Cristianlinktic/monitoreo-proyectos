'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Activity, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import type { ProjectWithMonitoring } from '@/lib/types'

interface StatsBarProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
  loading?: boolean
  showOnlyPending?: boolean
  onTogglePending?: () => void
}

const CARD_CONFIG = [
  {
    key: 'total',
    label: 'Proyectos',
    sublabel: 'en sistema',
    icon: Activity,
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.3)',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.06)',
  },
  {
    key: 'monitored',
    label: 'Monitoreados',
    sublabel: 'este día',
    icon: CheckCircle2,
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.3)',
    border: 'rgba(34,197,94,0.2)',
    bg: 'rgba(34,197,94,0.06)',
  },
  {
    key: 'withTasks',
    label: 'Con tareas',
    sublabel: 'pendientes',
    icon: AlertTriangle,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    border: 'rgba(245,158,11,0.2)',
    bg: 'rgba(245,158,11,0.06)',
  },
  {
    key: 'pending',
    label: 'Sin revisar',
    sublabel: 'este día',
    icon: Clock,
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.3)',
    border: 'rgba(139,92,246,0.2)',
    bg: 'rgba(139,92,246,0.06)',
  },
]

export function StatsBar({ projects, loading, showOnlyPending, onTogglePending }: StatsBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])

  const total     = projects.length
  const monitored = projects.filter(p => p.monitoring).length
  const withTasks = projects.filter(p => p.monitoring?.tareas_ejecutar?.trim()).length
  const pending   = total - monitored

  const values = [total, monitored, withTasks, pending]

  // Entrance animation — only on mount
  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.querySelectorAll('.stat-card')
    gsap.fromTo(cards,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    )
  }, [])

  // Count-up — fires every time loading finishes (i.e. every date navigation)
  useEffect(() => {
    if (loading) return
    numRefs.current.forEach((el, i) => {
      if (!el) return
      const target = { val: 0 }
      gsap.killTweensOf(target)
      gsap.to(target, {
        val: values[i],
        duration: 0.9,
        ease: 'power2.out',
        onUpdate() { if (el) el.textContent = String(Math.round(target.val)) },
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARD_CONFIG.map((cfg, i) => {
        const Icon = cfg.icon
        return (
          <div
            key={cfg.key}
            className="stat-card relative overflow-hidden rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(8,13,26,0.9) 100%)`,
              border: `1px solid ${cfg.key === 'pending' && showOnlyPending ? cfg.color + '60' : cfg.border}`,
              boxShadow: cfg.key === 'pending' && showOnlyPending ? `0 0 24px ${cfg.glow}` : 'none',
              cursor: cfg.key === 'pending' ? 'pointer' : 'default',
            }}
            onClick={cfg.key === 'pending' ? onTogglePending : undefined}
            onMouseEnter={e => {
              gsap.to(e.currentTarget, { y: -4, duration: 0.2, ease: 'power2.out' })
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${cfg.glow}, 0 0 0 1px ${cfg.border}`
            }}
            onMouseLeave={e => {
              gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power2.out' })
              ;(e.currentTarget as HTMLElement).style.boxShadow = cfg.key === 'pending' && showOnlyPending ? `0 0 24px ${cfg.glow}` : 'none'
            }}
          >
            {/* Scanline */}
            <div className="scanline" />

            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-xl blur-md pulse-ring"
                  style={{ background: cfg.glow }}
                />
                <div
                  className="relative p-2.5 rounded-xl"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
              </div>
              <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: cfg.color }}>
                {cfg.sublabel}
              </span>
            </div>

            {/* Value */}
            <div className="flex items-end gap-2">
              <span
                ref={el => { numRefs.current[i] = el }}
                className="text-4xl font-heading font-bold leading-none"
                style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.glow}` }}
              >
                0
              </span>
            </div>

            {/* Label */}
            <p className="text-xs text-[#64748B] mt-2 font-medium">
              {cfg.label}
              {cfg.key === 'pending' && (
                <span className="ml-2 text-[10px] tracking-wider" style={{ color: showOnlyPending ? cfg.color : '#334155' }}>
                  {showOnlyPending ? '· filtro activo' : '· click para ver'}
                </span>
              )}
            </p>

            {/* Progress bar */}
            {total > 0 && cfg.key !== 'total' && (
              <div className="mt-3 h-0.5 rounded-full bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.round((values[i] / total) * 100)}%`,
                    background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                    boxShadow: `0 0 8px ${cfg.glow}`,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
