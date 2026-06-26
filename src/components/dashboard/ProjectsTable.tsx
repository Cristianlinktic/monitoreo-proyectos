'use client'

import { useState } from 'react'
import { Search, Shield, Zap, LayoutDashboard, MessageSquare, HardDrive, SlidersHorizontal, X } from 'lucide-react'
import { ProjectRow } from './ProjectRow'
import type { ProjectWithMonitoring } from '@/lib/types'

interface ProjectsTableProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
  onRefresh: () => void
  showOnlyPending?: boolean
  onClearPending?: () => void
}

const TH = ({ children = null, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-3 text-left text-[10px] font-semibold text-[#334155] uppercase tracking-widest whitespace-nowrap ${className}`}>
    {children}
  </th>
)

export function ProjectsTable({ projects, selectedDate, onRefresh, showOnlyPending, onClearPending }: ProjectsTableProps) {
  const [search, setSearch] = useState('')

  const afterPendingFilter = showOnlyPending ? projects.filter(p => !p.monitoring) : projects

  const filtered = afterPendingFilter.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.maquetador ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const monitored = projects.filter(p => p.monitoring).length
  const pending   = projects.length - monitored

  return (
    <div className="flex flex-col gap-3">

      {/* Search + count bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#334155' }} />
          <input
            type="text"
            placeholder="Buscar proyecto o maquetador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
            style={{
              background: 'rgba(8,13,26,0.8)',
              border: '1px solid rgba(30,41,59,0.8)',
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(34,197,94,0.1)' }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]"
          style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,41,59,0.6)', color: '#475569' }}>
          <SlidersHorizontal className="w-3 h-3" />
          <span><span className="text-emerald-400 font-medium">{monitored}</span> ok · <span className="text-[#475569]">{pending}</span> pend.</span>
        </div>
      </div>

      {/* Active filter banner */}
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

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.7)', background: 'rgba(5,10,20,0.6)' }}>
        {/* Table top accent */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,41,59,0.8), transparent)' }} />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.9)', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                <TH className="w-8" />
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
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(30,41,59,0.8)' }}>
                        <Search className="w-5 h-5 text-[#334155]" />
                      </div>
                      <p className="text-sm text-[#334155]">
                        {search ? 'Sin resultados para esa búsqueda' : 'No hay proyectos aún'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(project => (
                  <ProjectRow key={project.id} project={project} selectedDate={selectedDate} onRefresh={onRefresh} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-[#1E293B] text-right tracking-wider">
        {filtered.length} / {projects.length} proyectos
      </p>
    </div>
  )
}
