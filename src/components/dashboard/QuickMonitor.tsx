'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { X, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import { upsertMonitoring } from '@/services/monitoring.service'
import { HealthRing } from './HealthRing'
import { ProjectEditModal } from './ProjectEditModal'
import { computeHealth } from '@/lib/health'
import type { ProjectWithMonitoring } from '@/lib/types'

interface QuickMonitorProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
  onRefresh: () => void
  onClose: () => void
}

interface RowState {
  saving: boolean
  showTaskInput: boolean
  taskText: string
}

export function QuickMonitor({ projects, selectedDate, onRefresh, onClose }: QuickMonitorProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({})
  const [editProject, setEditProject] = useState<ProjectWithMonitoring | null>(null)
  const [localMonitored, setLocalMonitored] = useState<Set<string>>(
    new Set(projects.filter(p => !!p.monitoring).map(p => p.id))
  )

  const sorted = [...projects].sort((a, b) => {
    const aM = localMonitored.has(a.id) ? 1 : 0
    const bM = localMonitored.has(b.id) ? 1 : 0
    return aM - bM || a.nombre.localeCompare(b.nombre)
  })

  const monitoredCount = localMonitored.size
  const total = projects.length
  const pct = total > 0 ? (monitoredCount / total) * 100 : 0

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { scale: 0.95, opacity: 0, y: 16 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      )
    }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const getRow = (id: string): RowState =>
    rowStates[id] ?? { saving: false, showTaskInput: false, taskText: '' }

  const setRow = (id: string, patch: Partial<RowState>) =>
    setRowStates(prev => ({ ...prev, [id]: { ...getRow(id), ...patch } }))

  const markOk = async (project: ProjectWithMonitoring) => {
    setRow(project.id, { saving: true })
    try {
      await upsertMonitoring({ project_id: project.id, fecha: selectedDate, estabilidad_diseno: 'Estable' })
      setLocalMonitored(prev => new Set([...prev, project.id]))
      onRefresh()
    } catch (e) { console.error(e) }
    setRow(project.id, { saving: false })
  }

  const markWithTask = async (project: ProjectWithMonitoring) => {
    const text = getRow(project.id).taskText.trim()
    if (!text) return
    setRow(project.id, { saving: true })
    try {
      await upsertMonitoring({ project_id: project.id, fecha: selectedDate, tareas_ejecutar: text })
      setLocalMonitored(prev => new Set([...prev, project.id]))
      setRow(project.id, { saving: false, showTaskInput: false, taskText: '' })
      onRefresh()
    } catch (e) {
      console.error(e)
      setRow(project.id, { saving: false })
    }
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div ref={cardRef} className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden opacity-0"
        style={{ background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(30,41,59,0.8)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Top accent */}
        <div className="h-px w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, transparent, #22C55E, #06B6D4, transparent)' }} />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#F8FAFC]">Monitoreo Rápido</p>
            <p className="text-[11px] text-[#475569] mt-0.5">{selectedDate} · {monitoredCount}/{total} revisados</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(30,41,59,0.6)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Cobertura</span>
            <span className="text-[10px] font-bold" style={{ color: pct === 100 ? '#22C55E' : '#64748B' }}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#22C55E' : 'linear-gradient(90deg, #22C55E, #06B6D4)',
                boxShadow: pct > 0 ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
              }} />
          </div>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {sorted.map(project => {
            const done = localMonitored.has(project.id)
            const row = getRow(project.id)
            const score = computeHealth(project.monitoring)

            return (
              <div key={project.id} className="flex flex-col gap-0" style={{ borderBottom: '1px solid rgba(30,41,59,0.3)' }}>
                <div className="flex items-center gap-3 px-2 py-3">
                  <HealthRing score={score} size={28} radius={10} stroke={2} />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <button onClick={() => setEditProject(project)}
                      className="text-sm font-medium text-left hover:text-emerald-400 transition-colors cursor-pointer leading-tight truncate block w-full"
                      style={{ color: done ? '#475569' : '#F8FAFC' }}>
                      {project.nombre}
                      <ChevronRight className="w-3 h-3 inline ml-1 opacity-30" />
                    </button>
                    {project.maquetador && (
                      <p className="text-[11px] text-[#334155]">{project.maquetador}</p>
                    )}
                  </div>

                  {/* Status / actions */}
                  {done ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-medium text-emerald-400">Revisado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => markOk(project)}
                        disabled={row.saving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.2)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)' }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        OK
                      </button>
                      <button
                        onClick={() => setRow(project.id, { showTaskInput: !row.showTaskInput })}
                        disabled={row.saving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                        style={{
                          background: row.showTaskInput ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)',
                          border: `1px solid rgba(245,158,11,${row.showTaskInput ? '0.4' : '0.2'})`,
                          color: '#F59E0B',
                        }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Tarea
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline task input */}
                {!done && row.showTaskInput && (
                  <div className="flex gap-2 px-2 pb-3">
                    <textarea
                      value={row.taskText}
                      onChange={e => setRow(project.id, { taskText: e.target.value })}
                      placeholder="Describe la tarea a ejecutar..."
                      rows={2}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none resize-none transition-all"
                      style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(245,158,11,0.3)' }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.5)' }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)' }}
                    />
                    <button
                      onClick={() => markWithTask(project)}
                      disabled={row.saving || !row.taskText.trim()}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold self-end transition-all cursor-pointer disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#020617' }}
                    >
                      {row.saving ? '…' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 shrink-0 flex justify-end" style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(30,41,59,0.7)', color: '#64748B' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Edit modal triggered from within QuickMonitor */}
      {editProject && (
        <ProjectEditModal
          open
          onClose={() => setEditProject(null)}
          onSuccess={() => { onRefresh(); setEditProject(null) }}
          project={editProject}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}
