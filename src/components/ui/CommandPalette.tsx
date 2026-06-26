'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Search, Plus, Upload, Download, Zap, Calendar, X } from 'lucide-react'
import { HealthRing } from '@/components/dashboard/HealthRing'
import { computeHealth } from '@/lib/health'
import { exportDayReport } from '@/lib/export'
import type { ProjectWithMonitoring } from '@/lib/types'

interface CommandPaletteProps {
  projects: ProjectWithMonitoring[]
  availableDates: string[]
  selectedDate: string
  onDateChange: (d: string) => void
  onNewProject: () => void
  onImport: () => void
  onQuickMonitor: () => void
}

type ItemKind = 'action' | 'project' | 'date'

interface Item {
  id: string
  kind: ItemKind
  label: string
  sub?: string
  icon?: React.ReactNode
  score?: number
  action: () => void
}

export function CommandPalette({
  projects, availableDates, selectedDate, onDateChange,
  onNewProject, onImport, onQuickMonitor,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.97, opacity: 0, y: -12, duration: 0.2, ease: 'power2.in',
        onComplete: () => setOpen(false),
      })
    } else {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setCursor(0)
      }
      if (e.key === 'Escape' && open) close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, close])

  useEffect(() => {
    if (open && cardRef.current) {
      gsap.fromTo(cardRef.current,
        { scale: 0.97, opacity: 0, y: -12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }
      )
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.toLowerCase().trim()

  const ACTIONS: Item[] = [
    { id: 'new',   kind: 'action', label: 'Nuevo proyecto',    icon: <Plus className="w-4 h-4 text-emerald-400" />,    action: () => { close(); onNewProject() } },
    { id: 'imp',   kind: 'action', label: 'Importar Excel',    icon: <Upload className="w-4 h-4 text-cyan-400" />,     action: () => { close(); onImport() } },
    { id: 'exp',   kind: 'action', label: 'Exportar hoy',      icon: <Download className="w-4 h-4 text-violet-400" />, action: () => { close(); exportDayReport(projects, selectedDate) } },
    { id: 'quick', kind: 'action', label: 'Monitoreo Rápido',  icon: <Zap className="w-4 h-4 text-amber-400" />,      action: () => { close(); onQuickMonitor() } },
  ]

  function matchSub(p: (typeof projects)[0], term: string): string | undefined {
    if (!term) return p.maquetador ?? undefined
    const candidates: [string, string | null | undefined][] = [
      ['url', p.url],
      ['dominio', p.dominio],
      ['usuario', p.usuario],
      ['plugin', (p.plugins ?? []).join(', ')],
      ['nota', p.monitoring?.notas],
      ['tarea', p.monitoring?.tareas_ejecutar],
    ]
    for (const [label, val] of candidates) {
      if ((val ?? '').toLowerCase().includes(term)) {
        const excerpt = (val ?? '').slice(0, 38).trim()
        return `${label}: ${excerpt}`
      }
    }
    return p.maquetador ?? undefined
  }

  const projectItems: Item[] = projects
    .filter(p => {
      if (!q) return true
      return [
        p.nombre,
        p.maquetador,
        p.url,
        p.dominio,
        p.usuario,
        (p.plugins ?? []).join(' '),
        p.monitoring?.notas,
        p.monitoring?.tareas_ejecutar,
      ].some(f => (f ?? '').toLowerCase().includes(q))
    })
    .slice(0, 8)
    .map(p => ({
      id: `p-${p.id}`,
      kind: 'project' as ItemKind,
      label: p.nombre,
      sub: matchSub(p, q),
      score: computeHealth(p.monitoring),
      action: () => { close(); router.push(`/proyecto/${p.id}`) },
    }))

  const dateItems: Item[] = availableDates
    .filter(d => !q || d.includes(q))
    .slice(0, 5)
    .map(d => ({
      id: `d-${d}`,
      kind: 'date' as ItemKind,
      label: d,
      icon: <Calendar className="w-3.5 h-3.5 text-[#475569]" />,
      action: () => { close(); onDateChange(d) },
    }))

  const filteredActions = q
    ? ACTIONS.filter(a => a.label.toLowerCase().includes(q))
    : ACTIONS

  const allItems: Item[] = [...filteredActions, ...projectItems, ...dateItems]

  useEffect(() => { setCursor(0) }, [query])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); allItems[cursor]?.action() }
    if (e.key === 'Escape')    close()
  }

  if (!open) return null

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
      style={{ background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === overlayRef.current) close() }}
    >
      <div ref={cardRef} className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'rgba(5,10,20,0.99)', border: '1px solid rgba(30,41,59,0.9)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Top accent */}
        <div className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #22C55E, #06B6D4, transparent)' }} />

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: '#334155' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Buscar proyectos, fechas, acciones..."
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none"
          />
          <button onClick={close} className="shrink-0 text-[#334155] hover:text-[#64748B] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[#334155]">Sin resultados</div>
          )}

          {/* Actions section */}
          {filteredActions.length > 0 && (
            <Section label="Acciones">
              {filteredActions.map((item, i) => (
                <ResultRow key={item.id} item={item} active={i === cursor} onClick={item.action} globalIndex={i} />
              ))}
            </Section>
          )}

          {/* Projects section */}
          {projectItems.length > 0 && (
            <Section label="Proyectos">
              {projectItems.map((item, i) => {
                const gi = filteredActions.length + i
                return (
                  <div key={item.id}
                    onClick={item.action}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all"
                    style={gi === cursor ? {
                      background: 'rgba(34,197,94,0.06)',
                      borderLeft: '2px solid #22C55E',
                    } : { borderLeft: '2px solid transparent' }}
                    onMouseEnter={() => setCursor(gi)}
                  >
                    {item.score !== undefined && (
                      <HealthRing score={item.score} size={20} radius={7} stroke={2} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F8FAFC] truncate">{item.label}</p>
                      {item.sub && <p className="text-[11px] text-[#334155]">{item.sub}</p>}
                    </div>
                  </div>
                )
              })}
            </Section>
          )}

          {/* Dates section */}
          {dateItems.length > 0 && (
            <Section label="Fechas">
              {dateItems.map((item, i) => {
                const gi = filteredActions.length + projectItems.length + i
                return <ResultRow key={item.id} item={item} active={gi === cursor} onClick={item.action} globalIndex={gi} onHover={() => setCursor(gi)} />
              })}
            </Section>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 flex items-center gap-4 text-[10px] text-[#1E293B]"
          style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
          <span>↑↓ navegar</span>
          <span>↵ seleccionar</span>
          <span>Esc cerrar</span>
          <span className="ml-auto">⌘K para abrir</span>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1E293B]">{label}</p>
      {children}
    </div>
  )
}

function ResultRow({ item, active, onClick, globalIndex, onHover }: {
  item: Item; active: boolean; onClick: () => void; globalIndex: number; onHover?: () => void
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all"
      style={active ? {
        background: 'rgba(34,197,94,0.06)',
        borderLeft: '2px solid #22C55E',
      } : { borderLeft: '2px solid transparent' }}
    >
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F8FAFC] truncate">{item.label}</p>
        {item.sub && <p className="text-[11px] text-[#334155]">{item.sub}</p>}
      </div>
    </div>
  )
}
