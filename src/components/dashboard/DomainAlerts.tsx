'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { AlertTriangle, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import type { ProjectWithMonitoring } from '@/lib/types'

interface DomainAlertsProps {
  projects: ProjectWithMonitoring[]
}

function daysDiff(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function severity(days: number): 'expired' | 'critical' | 'upcoming' | null {
  if (days <= 0)  return 'expired'
  if (days <= 30) return 'critical'
  if (days <= 90) return 'upcoming'
  return null
}

const SEV_COLOR = {
  expired:  '#EF4444',
  critical: '#F59E0B',
  upcoming: '#06B6D4',
}

const SEV_BG = {
  expired:  'rgba(239,68,68,0.08)',
  critical: 'rgba(245,158,11,0.08)',
  upcoming: 'rgba(6,182,212,0.08)',
}

const SEV_BORDER = {
  expired:  'rgba(239,68,68,0.2)',
  critical: 'rgba(245,158,11,0.2)',
  upcoming: 'rgba(6,182,212,0.2)',
}

const SEV_LABEL = {
  expired:  (days: number) => `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`,
  critical: (days: number) => `Vence en ${days} día${days !== 1 ? 's' : ''}`,
  upcoming: (days: number) => `Vence en ${days} días`,
}

export function DomainAlerts({ projects }: DomainAlertsProps) {
  const alertItems = projects
    .filter(p => p.vencimiento_dominio)
    .map(p => {
      const days = daysDiff(p.vencimiento_dominio!)
      const sev = severity(days)
      return sev ? { project: p, days, sev } : null
    })
    .filter(Boolean) as { project: ProjectWithMonitoring; days: number; sev: 'expired' | 'critical' | 'upcoming' }[]

  const urgent = alertItems.some(a => a.sev === 'expired' || a.sev === 'critical')
  const [open, setOpen] = useState(urgent)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current) return
    if (open) {
      gsap.fromTo(listRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    } else {
      gsap.to(listRef.current, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' })
    }
  }, [open])

  if (alertItems.length === 0) return null

  const worstColor = alertItems.find(a => a.sev === 'expired')
    ? SEV_COLOR.expired
    : alertItems.find(a => a.sev === 'critical')
    ? SEV_COLOR.critical
    : SEV_COLOR.upcoming

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(8,13,26,0.9)', border: `1px solid rgba(30,41,59,0.7)` }}>

      {/* Top accent */}
      <div className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${worstColor}60, transparent)` }} />

      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: 'rgba(5,10,20,0.6)' }}
      >
        <div className="p-1.5 rounded-lg" style={{ background: `${worstColor}15`, border: `1px solid ${worstColor}30` }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: worstColor }} />
        </div>
        <span className="font-semibold text-sm text-[#F8FAFC] flex-1 text-left">
          Vencimientos de dominio
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${worstColor}20`, color: worstColor, border: `1px solid ${worstColor}40` }}>
            {alertItems.length}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-[#475569]" />
            : <ChevronDown className="w-4 h-4 text-[#475569]" />}
        </div>
      </button>

      {/* List */}
      <div ref={listRef} style={{ overflow: 'hidden', height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}>
        <div className="px-4 pb-4 flex flex-col gap-2 pt-1">
          {alertItems.map(({ project, days, sev }) => (
            <div key={project.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: SEV_BG[sev], border: `1px solid ${SEV_BORDER[sev]}` }}>
              <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: SEV_COLOR[sev] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F8FAFC] truncate">{project.nombre}</p>
                {project.dominio && (
                  <p className="text-[11px] text-[#475569] truncate">{project.dominio}</p>
                )}
              </div>
              <span className="text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-lg"
                style={{ background: `${SEV_COLOR[sev]}15`, color: SEV_COLOR[sev] }}>
                {SEV_LABEL[sev](days)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
