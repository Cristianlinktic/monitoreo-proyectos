'use client'

import { useState } from 'react'
import { Search, Shield, Zap, LayoutDashboard, MessageSquare, HardDrive } from 'lucide-react'
import { ProjectRow } from './ProjectRow'
import type { ProjectWithMonitoring } from '@/lib/types'

interface ProjectsTableProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
  onRefresh: () => void
}

const TH = ({ children = null, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider whitespace-nowrap ${className}`}>
    {children}
  </th>
)

export function ProjectsTable({ projects, selectedDate, onRefresh }: ProjectsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = projects.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.maquetador ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar proyecto o maquetador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0A0F1E] border-b border-[#1E293B]">
                <TH className="w-8" />
                <TH>Proyecto</TH>
                <TH className="hidden md:table-cell">Plugins</TH>
                <TH className="hidden lg:table-cell">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />SSL</span>
                </TH>
                <TH className="hidden lg:table-cell">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Rendimiento</span>
                </TH>
                <TH className="hidden xl:table-cell">
                  <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" />Estabilidad</span>
                </TH>
                <TH className="hidden xl:table-cell">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />Formularios</span>
                </TH>
                <TH className="hidden xl:table-cell">
                  <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />Backup</span>
                </TH>
                <TH>Estado</TH>
                <TH>Acción</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-sm text-[#475569]">
                    {search ? 'No se encontraron proyectos con esa búsqueda.' : 'No hay proyectos aún. Crea el primero.'}
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    selectedDate={selectedDate}
                    onRefresh={onRefresh}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[#334155] text-right">
        {filtered.length} de {projects.length} proyectos
      </p>
    </div>
  )
}
