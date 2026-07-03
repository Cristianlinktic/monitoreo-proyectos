'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Shield, LayoutDashboard, MessageSquare,
  HardDrive, FileText, ListTodo, Edit3, Plus, Package, ExternalLink,
  Globe, User, Key, Calendar, Sigma, Copy, Check, Archive, GripVertical,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ProjectEditModal } from './ProjectEditModal'
import { HealthRing } from './HealthRing'
import { computeHealth } from '@/lib/health'
import { archiveProject } from '@/services/projects.service'
import { cn } from '@/lib/utils'
import type { ProjectWithMonitoring, StatusLevel } from '@/lib/types'

function inferStatus(value: string | null | undefined): StatusLevel {
  if (!value) return 'pending'
  const v = value.toLowerCase()
  if (v === 'estable' || v === 'bien' || v.includes('ok') || v.includes('funcional') || v.includes('activo') || v.includes('diario')) return 'ok'
  if (v === 'mal' || v.includes('falla') || v.includes('critico') || v.includes('error') || v.includes('vencido')) return 'critical'
  if (v.includes('parcial') || v.includes('revisar') || v.includes('pendiente')) return 'warning'
  return 'ok'
}

function StatusCell({ value, showImage, imageUrl }: { value: string | null; showImage?: boolean; imageUrl?: string | null }) {
  const [imgOpen, setImgOpen] = useState(false)
  if (!value && !imageUrl) return <span className="text-xs text-[#1E293B]">—</span>
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {imageUrl && (
        <>
          <button onClick={e => { e.stopPropagation(); setImgOpen(true) }} className="group cursor-pointer" aria-label="Ver imagen">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="captura" className="w-8 h-8 rounded-lg object-cover transition-all" style={{ border: '1px solid rgba(30,41,59,0.8)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(30,41,59,0.8)')} />
          </button>
          {imgOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)' }} onClick={e => { e.stopPropagation(); setImgOpen(false) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="captura" className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: '0 0 80px rgba(34,197,94,0.1)' }} />
            </div>
          )}
        </>
      )}
      {value && <Badge variant={inferStatus(value)}>{value}</Badge>}
    </div>
  )
}

function CopyableValue({ value, secret }: { value: string; secret?: boolean }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-2 group/copy">
      <span className="text-xs font-mono text-[#CBD5E1]">{secret && !show ? '••••••••••' : value}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover/copy:opacity-100 transition-opacity">
        {secret && (
          <button onClick={() => setShow(s => !s)} className="text-[10px] text-[#334155] hover:text-emerald-400 transition-colors cursor-pointer">
            {show ? 'ocultar' : 'ver'}
          </button>
        )}
        <button onClick={copy} className="text-[#334155] hover:text-cyan-400 transition-colors cursor-pointer">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  )
}

function DataBlock({ icon, label, value, secret, link, accent = '#94A3B8' }: {
  icon: React.ReactNode; label: string; value: string; secret?: boolean; link?: boolean; accent?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl" style={{ background: 'rgba(8,13,26,0.7)', border: '1px solid rgba(30,41,59,0.5)' }}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent + '80' }}>{label}</span>
      </div>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate transition-colors">
          {value}
        </a>
      ) : secret ? (
        <CopyableValue value={value} secret />
      ) : (
        <p className="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">{value}</p>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1" style={{ background: 'rgba(30,41,59,0.6)' }} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#334155]">{children}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(30,41,59,0.6)' }} />
    </div>
  )
}

interface DragHandlers {
  draggable: true
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  isDragOver: boolean
}

interface ProjectRowProps {
  project: ProjectWithMonitoring
  selectedDate: string
  onRefresh: () => void
  dragHandlers?: DragHandlers
}

export function ProjectRow({ project, selectedDate, onRefresh, dragHandlers }: ProjectRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const expandRef = useRef<HTMLTableRowElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)
  const m = project.monitoring
  const hasData = !!m
  const healthScore = computeHealth(m)

  useEffect(() => {
    if (!expandRef.current) return
    if (expanded) {
      gsap.fromTo(expandRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      )
    }
  }, [expanded])

  const handleRowHover = (enter: boolean) => {
    if (!rowRef.current) return
    gsap.to(rowRef.current, {
      backgroundColor: enter ? 'rgba(15,23,42,0.6)' : 'transparent',
      duration: 0.15,
    })
  }

  return (
    <>
      <tr
        ref={rowRef}
        className="border-b transition-colors"
        draggable={dragHandlers?.draggable}
        onDragStart={dragHandlers?.onDragStart}
        onDragOver={dragHandlers?.onDragOver}
        onDrop={dragHandlers?.onDrop}
        onDragEnd={() => {}}
        onClick={() => setExpanded(p => !p)}
        style={{
          borderColor: dragHandlers?.isDragOver ? 'rgba(34,197,94,0.5)' : 'rgba(30,41,59,0.4)',
          cursor: dragHandlers ? 'grab' : 'pointer',
          background: dragHandlers?.isDragOver ? 'rgba(34,197,94,0.04)' : undefined,
        }}
        onMouseEnter={() => handleRowHover(true)}
        onMouseLeave={() => handleRowHover(false)}
      >
        {/* Expand toggle + drag handle */}
        <td className="w-8 pl-3">
          <div className="flex items-center gap-0.5">
            {dragHandlers && (
              <GripVertical className="w-3 h-3 shrink-0 opacity-20 group-hover:opacity-60 transition-opacity" style={{ color: '#475569' }} />
            )}
            <button
              onClick={e => { e.stopPropagation(); setExpanded(p => !p) }}
              className="p-1.5 rounded-lg transition-all cursor-pointer"
              style={{ color: '#334155' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22C55E'; (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {expanded
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>

        {/* Health ring */}
        <td className="px-2 py-2 w-10">
          <HealthRing score={healthScore} />
        </td>

        {/* Nombre */}
        <td className="px-3 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {/* Status dot */}
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: hasData ? '#22C55E' : '#334155',
                  boxShadow: hasData ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
                }}
              />
              <Link
                href={`/proyecto/${project.id}`}
                onClick={e => e.stopPropagation()}
                className="font-semibold text-sm text-[#F8FAFC] hover:underline underline-offset-2 decoration-[#475569]"
              >
                {project.nombre}
              </Link>
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-[#334155] hover:text-cyan-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {project.maquetador && (
              <span className="text-[11px] text-[#334155] ml-3.5">{project.maquetador}</span>
            )}
          </div>
        </td>

        {/* Plugins */}
        <td className="px-3 py-3 hidden md:table-cell">
          {project.plugins.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-[#334155]" />
              <span className="text-xs text-[#475569]">{project.plugins.length}</span>
            </div>
          ) : (
            <span className="text-xs text-[#1E293B]">—</span>
          )}
        </td>

        {/* SSL */}
        <td className="px-3 py-3 hidden lg:table-cell">
          <StatusCell value={null} showImage imageUrl={m?.ssl_imagen_url} />
        </td>

        {/* Rendimiento */}
        <td className="px-3 py-3 hidden lg:table-cell">
          <StatusCell value={m?.rendimiento_score ?? null} showImage imageUrl={m?.rendimiento_imagen_url ?? null} />
        </td>

        {/* Estabilidad */}
        <td className="px-3 py-3 hidden xl:table-cell">
          {m?.estabilidad_diseno
            ? <span className="text-xs text-[#94A3B8]">{m.estabilidad_diseno}</span>
            : <span className="text-xs text-[#1E293B]">—</span>}
        </td>

        {/* Formularios */}
        <td className="px-3 py-3 hidden xl:table-cell">
          {m?.pruebas_formularios
            ? <Badge variant={inferStatus(m.pruebas_formularios)}>{m.pruebas_formularios}</Badge>
            : <span className="text-xs text-[#1E293B]">—</span>}
        </td>

        {/* Backup */}
        <td className="px-3 py-3 hidden xl:table-cell">
          {m?.backup
            ? <Badge variant={inferStatus(m.backup)}>{m.backup}</Badge>
            : <span className="text-xs text-[#1E293B]">—</span>}
        </td>

        {/* Estado */}
        <td className="px-3 py-3">
          {hasData
            ? <Badge variant="ok">Monitoreado</Badge>
            : <Badge variant="pending">Pendiente</Badge>}
        </td>

        {/* Acción */}
        <td className="px-3 py-3">
          <button
            onClick={e => { e.stopPropagation(); setEditOpen(true) }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95',
            )}
            style={hasData ? {
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(30,41,59,0.8)',
              color: '#64748B',
            } : {
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.08))',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E',
              boxShadow: '0 0 12px rgba(34,197,94,0.15)',
            }}
            onMouseEnter={e => {
              if (hasData) {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'
                ;(e.currentTarget as HTMLElement).style.color = '#22C55E'
              }
            }}
            onMouseLeave={e => {
              if (hasData) {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'
                ;(e.currentTarget as HTMLElement).style.color = '#64748B'
              }
            }}
          >
            {hasData ? <><Edit3 className="w-3 h-3" />Editar</> : <><Plus className="w-3 h-3" />Registrar</>}
          </button>
        </td>
      </tr>

      {/* Expanded panel */}
      {expanded && (
        <tr ref={expandRef} style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
          <td colSpan={11} className="px-4 py-5" style={{ background: 'rgba(3,7,18,0.8)' }}>

            {/* Archivar proyecto - arriba a la derecha */}
            <div className="flex justify-end mb-3">
              <button
                onClick={async () => {
                  if (!window.confirm('¿Archivar este proyecto? Desaparecerá del dashboard pero se puede restaurar.')) return
                  await archiveProject(project.id, true).catch(console.error)
                  onRefresh()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(30,41,59,0.5)', color: '#475569' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F59E0B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.5)' }}
              >
                <Archive className="w-3 h-3" />
                Archivar proyecto
              </button>
            </div>

            {/* Top accent */}
            <div className="h-px w-full mb-5" style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.3), transparent)' }} />

            <div className="flex flex-col gap-5">

              {/* Acceso */}
              {(project.link_acceso_editor || project.usuario || project.clave || project.dominio || project.autenticador || project.vencimiento_dominio) && (
                <div>
                  <SectionLabel>Acceso</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {project.dominio         && <DataBlock icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}     label="Dominio"    value={project.dominio} accent="#3B82F6" />}
                    {project.link_acceso_editor && <DataBlock icon={<ExternalLink className="w-3.5 h-3.5 text-cyan-400" />} label="Editor"  value={project.link_acceso_editor} link accent="#06B6D4" />}
                    {project.usuario         && <DataBlock icon={<User className="w-3.5 h-3.5 text-amber-400" />}     label="Usuario"    value={project.usuario} accent="#F59E0B" />}
                    {project.clave           && <DataBlock icon={<Key className="w-3.5 h-3.5 text-red-400" />}        label="Clave"      value={project.clave} secret accent="#EF4444" />}
                    {project.autenticador    && <DataBlock icon={<Shield className="w-3.5 h-3.5 text-violet-400" />}  label="Auth"       value={project.autenticador} accent="#8B5CF6" />}
                    {project.vencimiento_dominio && <DataBlock icon={<Calendar className="w-3.5 h-3.5 text-orange-400" />} label="Vencimiento" value={project.vencimiento_dominio} accent="#F97316" />}
                  </div>
                </div>
              )}

              {/* Configuración */}
              {(project.licencias || project.figma_url || project.ceco) && (
                <div>
                  <SectionLabel>Configuración</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.ceco       && <DataBlock icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}  label="CECO"     value={project.ceco} />}
                    {project.licencias  && <DataBlock icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}   label="Licencias" value={project.licencias} />}
                    {project.figma_url  && <DataBlock icon={<Sigma className="w-3.5 h-3.5 text-purple-400" />}   label="Figma"    value={project.figma_url} link accent="#A855F7" />}
                  </div>
                </div>
              )}

              {/* Plugins */}
              {project.plugins.length > 0 && (
                <div>
                  <SectionLabel>Plugins · {project.plugins.length}</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {project.plugins.map(p => (
                      <span key={p}
                        className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(30,41,59,0.7)', color: '#64748B' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Redirects de formularios */}
              {project.redirects && project.redirects.length > 0 && (
                <div>
                  <SectionLabel>Redirects de formularios · {project.redirects.length}</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    <div className="flex flex-col gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(8,13,26,0.7)', border: '1px solid rgba(30,41,59,0.5)' }}>
                      <div className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(6,182,212,0.5)' }}>Formularios</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {project.redirects.map((r, i) => (
                          r.url ? (
                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" title={r.url}
                              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate transition-colors">
                              {r.nombre || r.url}
                            </a>
                          ) : (
                            <span key={i} className="text-xs text-[#CBD5E1] truncate">{r.nombre}</span>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoreo */}
              {m && (
                <div>
                  <SectionLabel>Monitoreo · {m.fecha}</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {m.backup              && <DataBlock icon={<HardDrive className="w-3.5 h-3.5 text-emerald-400" />}     label="Backup"      value={m.backup} accent="#22C55E" />}
                    {m.pruebas_formularios && <DataBlock icon={<MessageSquare className="w-3.5 h-3.5 text-violet-400" />}  label="Formularios" value={m.pruebas_formularios} accent="#8B5CF6" />}
                    {m.estabilidad_diseno  && <DataBlock icon={<LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />}  label="Estabilidad" value={m.estabilidad_diseno} accent="#06B6D4" />}
                    {m.notas               && <DataBlock icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}         label="Notas"       value={m.notas ?? ''} />}
                    {m.tareas_ejecutar     && <DataBlock icon={<ListTodo className="w-3.5 h-3.5 text-amber-400" />}        label="Tareas"      value={m.tareas_ejecutar ?? ''} accent="#F59E0B" />}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

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
