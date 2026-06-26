'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import {
  Search, Shield, Zap, LayoutDashboard, MessageSquare, HardDrive,
  SlidersHorizontal, X, LayoutGrid, LayoutList, Edit3, Plus, ExternalLink,
  Download,
} from 'lucide-react'
import { ProjectRow } from './ProjectRow'
import { ProjectEditModal } from './ProjectEditModal'
import { HealthRing } from './HealthRing'
import { computeHealth, healthColor } from '@/lib/health'
import { exportDayReport } from '@/lib/export'
import type { ProjectWithMonitoring } from '@/lib/types'

interface ProjectsTableProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
  onRefresh: () => void
  loading?: boolean
  showOnlyPending?: boolean
  onClearPending?: () => void
}

const TH = ({ children = null, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-3 text-left text-[10px] font-semibold text-[#334155] uppercase tracking-widest whitespace-nowrap ${className}`}>
    {children}
  </th>
)

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.2)' }}>
      <td className="px-3 py-3 w-8"><div className="w-5 h-5 rounded bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3"><div className="w-8 h-8 rounded-full bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="w-32 h-3 rounded bg-[#0F172A] animate-pulse" />
          <div className="w-20 h-2.5 rounded bg-[#0A0F1E] animate-pulse" />
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell"><div className="w-10 h-3 rounded bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3 hidden lg:table-cell"><div className="w-8 h-8 rounded-lg bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3 hidden lg:table-cell"><div className="w-8 h-8 rounded-lg bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3 hidden xl:table-cell"><div className="w-16 h-3 rounded bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3 hidden xl:table-cell"><div className="w-12 h-3 rounded bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3 hidden xl:table-cell"><div className="w-12 h-3 rounded bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3"><div className="w-20 h-5 rounded-md bg-[#0F172A] animate-pulse" /></td>
      <td className="px-3 py-3"><div className="w-16 h-6 rounded-lg bg-[#0F172A] animate-pulse" /></td>
    </tr>
  )
}

function ProjectCard({ project, selectedDate, onRefresh }: { project: ProjectWithMonitoring; selectedDate: string; onRefresh: () => void }) {
  const [editOpen, setEditOpen] = useState(false)
  const score = computeHealth(project.monitoring)
  const color = healthColor(score)
  const m = project.monitoring

  return (
    <>
      <div
        className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-default"
        style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = color + '50'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}20`
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.7)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          <HealthRing score={score} size={56} radius={22} stroke={3} />
          <div className="text-center">
            <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">{project.nombre}</p>
            {project.maquetador && <p className="text-[11px] text-[#334155] mt-0.5">{project.maquetador}</p>}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {m?.ssl_imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.ssl_imagen_url} alt="SSL" className="w-7 h-7 rounded object-cover" style={{ border: '1px solid rgba(30,41,59,0.8)' }} />
          ) : (
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
              <Shield className="w-3.5 h-3.5 text-[#1E293B]" />
            </div>
          )}
          {m?.rendimiento_imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.rendimiento_imagen_url} alt="Rendimiento" className="w-7 h-7 rounded object-cover" style={{ border: '1px solid rgba(30,41,59,0.8)' }} />
          ) : (
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
              <Zap className="w-3.5 h-3.5 text-[#1E293B]" />
            </div>
          )}
          {m?.estabilidad_diseno && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4' }}>
              {m.estabilidad_diseno.slice(0, 8)}
            </span>
          )}
          {m?.pruebas_formularios && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>
              {m.pruebas_formularios.slice(0, 6)}
            </span>
          )}
          {m?.backup && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
              BK
            </span>
          )}
          {!m && <span className="text-[11px] text-[#334155]">Sin datos</span>}
        </div>

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
          {project.url ? (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[#334155] hover:text-cyan-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : <div />}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
            style={m ? {
              background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)', color: '#64748B',
            } : {
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.08))',
              border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E',
            }}
          >
            {m ? <><Edit3 className="w-3 h-3" />Editar</> : <><Plus className="w-3 h-3" />Registrar</>}
          </button>
        </div>
      </div>

      {editOpen && (
        <ProjectEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={onRefresh}
          project={project}
          selectedDate={selectedDate}
        />
      )}
    </>
  )
}

export function ProjectsTable({ projects, selectedDate, onRefresh, loading, showOnlyPending, onClearPending }: ProjectsTableProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    maquetador: '',
    minHealth: 0,
    soloConTareas: false,
    plugin: '',
  })
  const [dragOrder, setDragOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('project-order') || '[]') } catch { return [] }
  })
  const [dragId, setDragId]       = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const tbodyRef     = useRef<HTMLTableSectionElement>(null)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const prevLoading  = useRef<boolean>(true)

  // Unique maquetador values
  const maquetadores = Array.from(
    new Set(projects.map(p => p.maquetador).filter(Boolean) as string[])
  ).sort()

  const activeFilterCount = [
    filters.maquetador !== '',
    filters.minHealth > 0,
    filters.soloConTareas,
    filters.plugin !== '',
  ].filter(Boolean).length

  // Filter chain
  const afterPendingFilter = showOnlyPending ? projects.filter(p => !p.monitoring) : projects
  const afterSearchFilter  = afterPendingFilter.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.maquetador ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const filtered = afterSearchFilter.filter(p => {
    if (filters.maquetador && p.maquetador !== filters.maquetador) return false
    if (filters.minHealth > 0 && computeHealth(p.monitoring) < filters.minHealth) return false
    if (filters.soloConTareas && !p.monitoring?.tareas_ejecutar?.trim()) return false
    if (filters.plugin) {
      const plugs = (p.plugins ?? []).join(' ').toLowerCase()
      if (!plugs.includes(filters.plugin.toLowerCase())) return false
    }
    return true
  })

  const monitored = projects.filter(p => p.monitoring).length
  const pending   = projects.length - monitored

  const orderedFiltered = useMemo(() => {
    if (!dragOrder.length) return filtered
    return [...filtered].sort((a, b) => {
      const ai = dragOrder.indexOf(a.id), bi = dragOrder.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [filtered, dragOrder])

  // Animate rows when loading finishes
  useEffect(() => {
    if (prevLoading.current && !loading && tbodyRef.current) {
      const rows = tbodyRef.current.querySelectorAll('tr')
      if (rows.length > 0) {
        gsap.fromTo(rows,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out', delay: 0.05 }
        )
      }
    }
    prevLoading.current = loading ?? false
  }, [loading])

  // Animate filter panel
  useEffect(() => {
    if (!filterPanelRef.current) return
    if (showFilters) {
      gsap.fromTo(filterPanelRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.28, ease: 'power2.out' }
      )
    } else {
      gsap.to(filterPanelRef.current, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
    }
  }, [showFilters])

  const clearFilters = () => setFilters({ maquetador: '', minHealth: 0, soloConTareas: false, plugin: '' })

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const currentIds = filtered.map(p => p.id)
    const fromIdx = currentIds.indexOf(dragId)
    const toIdx   = currentIds.indexOf(targetId)
    const newOrder = [...currentIds]
    newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, dragId)
    setDragOrder(newOrder)
    localStorage.setItem('project-order', JSON.stringify(newOrder))
    setDragId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Search + controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#334155' }} />
          <input
            type="text"
            placeholder="Buscar proyecto o maquetador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
            style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(34,197,94,0.1)' }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          />
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(s => !s)}
          className="relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
          style={{
            background: showFilters ? 'rgba(34,197,94,0.08)' : 'rgba(8,13,26,0.8)',
            border: showFilters ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(30,41,59,0.7)',
            color: showFilters ? '#22C55E' : '#475569',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: '#22C55E', color: '#020617' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]"
          style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,41,59,0.6)', color: '#475569' }}>
          <span><span className="text-emerald-400 font-medium">{monitored}</span> ok · <span>{pending}</span> pend.</span>
        </div>

        {/* Export button */}
        <button
          onClick={() => exportDayReport(projects, selectedDate)}
          aria-label="Exportar reporte del día"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
          style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,41,59,0.7)', color: '#475569' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.3)'
            ;(e.currentTarget as HTMLElement).style.color = '#06B6D4'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(6,182,212,0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.7)'
            ;(e.currentTarget as HTMLElement).style.color = '#475569'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        {/* View toggle */}
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.7)', background: 'rgba(8,13,26,0.8)' }}>
          <button
            onClick={() => setViewMode('table')}
            className="p-2 transition-all cursor-pointer"
            style={{ color: viewMode === 'table' ? '#22C55E' : '#334155', background: viewMode === 'table' ? 'rgba(34,197,94,0.08)' : 'transparent' }}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 transition-all cursor-pointer"
            style={{ color: viewMode === 'grid' ? '#22C55E' : '#334155', background: viewMode === 'grid' ? 'rgba(34,197,94,0.08)' : 'transparent' }}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div ref={filterPanelRef} style={{ overflow: 'hidden', height: 0, opacity: 0 }}>
        <div className="p-4 rounded-2xl flex flex-col gap-3"
          style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Maquetador */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Maquetador</label>
              <select
                value={filters.maquetador}
                onChange={e => setFilters(f => ({ ...f, maquetador: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm text-[#F8FAFC] focus:outline-none cursor-pointer"
                style={{ background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.7)' }}
              >
                <option value="">Todos</option>
                {maquetadores.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Health mínimo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Health mínimo</label>
              <div className="flex gap-1">
                {([0, 60, 80, 100] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFilters(f => ({ ...f, minHealth: v }))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={filters.minHealth === v ? {
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#22C55E',
                    } : {
                      background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.6)', color: '#475569',
                    }}
                  >
                    {v === 0 ? 'Todos' : `${v}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Plugin</label>
              <input
                type="text"
                placeholder="Filtrar por plugin..."
                value={filters.plugin}
                onChange={e => setFilters(f => ({ ...f, plugin: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none"
                style={{ background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.7)' }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.35)' }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.7)' }}
              />
            </div>

            {/* Con tareas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Tareas</label>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, soloConTareas: !f.soloConTareas }))}
                className="py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer text-left"
                style={filters.soloConTareas ? {
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B',
                } : {
                  background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.7)', color: '#475569',
                }}
              >
                {filters.soloConTareas ? '✓ ' : ''}Solo con tareas pendientes
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active pending filter banner */}
      {showOnlyPending && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6', boxShadow: '0 0 6px rgba(139,92,246,0.6)' }} />
            <span className="text-xs text-[#8B5CF6] font-medium">
              Mostrando {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} sin monitorear
            </span>
          </div>
          <button onClick={onClearPending}
            className="flex items-center gap-1 text-[11px] text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer">
            <X className="w-3 h-3" /> Quitar filtro
          </button>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 flex flex-col gap-3 animate-pulse"
                  style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.4)' }}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#0F172A]" />
                    <div className="w-24 h-3 rounded bg-[#0F172A]" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[1,2,3].map(j => <div key={j} className="w-7 h-7 rounded bg-[#0F172A]" />)}
                  </div>
                </div>
              ))
            : orderedFiltered.map(p => (
                <ProjectCard key={p.id} project={p} selectedDate={selectedDate} onRefresh={onRefresh} />
              ))
          }
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.7)', background: 'rgba(5,10,20,0.6)' }}>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,41,59,0.8), transparent)' }} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(8,13,26,0.9)', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                  <TH className="w-8" />
                  <TH className="w-10">Score</TH>
                  <TH>Proyecto</TH>
                  <TH className="hidden md:table-cell">Plugins</TH>
                  <TH className="hidden lg:table-cell">
                    <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-blue-500/60" />SSL</span>
                  </TH>
                  <TH className="hidden lg:table-cell">
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500/60" />Rendimiento</span>
                  </TH>
                  <TH className="hidden xl:table-cell">
                    <span className="flex items-center gap-1.5"><LayoutDashboard className="w-3 h-3 text-cyan-500/60" />Estabilidad</span>
                  </TH>
                  <TH className="hidden xl:table-cell">
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-violet-500/60" />Formularios</span>
                  </TH>
                  <TH className="hidden xl:table-cell">
                    <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3 text-emerald-500/60" />Backup</span>
                  </TH>
                  <TH>Estado</TH>
                  <TH>Acción</TH>
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(30,41,59,0.8)' }}>
                          <Search className="w-5 h-5 text-[#334155]" />
                        </div>
                        <p className="text-sm text-[#334155]">
                          {search || activeFilterCount > 0 ? 'Sin resultados con los filtros activos' : 'No hay proyectos aún'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orderedFiltered.map(project => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      selectedDate={selectedDate}
                      onRefresh={onRefresh}
                      dragHandlers={{
                        draggable: true,
                        isDragOver: dragOverId === project.id,
                        onDragStart: () => setDragId(project.id),
                        onDragOver: (e) => { e.preventDefault(); setDragOverId(project.id) },
                        onDrop: () => handleDrop(project.id),
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-[#1E293B] text-right tracking-wider">
        {filtered.length} / {projects.length} proyectos
      </p>
    </div>
  )
}
