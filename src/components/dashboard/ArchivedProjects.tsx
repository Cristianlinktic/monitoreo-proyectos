'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Archive, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { getArchivedProjects, archiveProject } from '@/services/projects.service'
import type { Project } from '@/lib/types'

interface ArchivedProjectsProps {
  onRestore: () => void
}

export function ArchivedProjects({ onRestore }: ArchivedProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const reload = () => {
    getArchivedProjects()
      .then(data => { setProjects(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }

  useEffect(() => { reload() }, [])

  const handleRestore = async (id: string) => {
    await archiveProject(id, false).catch(console.error)
    reload()
    onRestore()
  }

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

  if (!loaded || projects.length === 0) return null

  const color = '#64748B'

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>

      <div className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: 'rgba(5,10,20,0.6)' }}
      >
        <div className="p-1.5 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Archive className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="font-semibold text-sm text-[#F8FAFC] flex-1 text-left">Proyectos archivados</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
            {projects.length}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-[#475569]" />
            : <ChevronDown className="w-4 h-4 text-[#475569]" />}
        </div>
      </button>

      <div ref={listRef} style={{ overflow: 'hidden', height: 0, opacity: 0 }}>
        <div className="px-4 pb-4 flex flex-col gap-2 pt-1">
          {projects.map(p => (
            <div key={p.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(30,41,59,0.1)', border: '1px solid rgba(30,41,59,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#334155]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#64748B] truncate">{p.nombre}</p>
                {p.maquetador && (
                  <p className="text-[11px] text-[#334155]">{p.maquetador}</p>
                )}
              </div>
              <button
                onClick={() => handleRestore(p.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.08)' }}
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
