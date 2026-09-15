'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Shield, LayoutDashboard, MessageSquare,
  HardDrive, FileText, ListTodo, ExternalLink,
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
  if (!value && !imageUrl) return <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {imageUrl && (
        <>
          <button onClick={e => { e.stopPropagation(); setImgOpen(true) }} className="group cursor-pointer" aria-label="Ver imagen">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="captura" className="w-8 h-8 rounded-lg object-cover transition-all" style={{ border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(244,114,194,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
          </button>
          {imgOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,7,19,0.9)', backdropFilter: 'blur(12px)' }} onClick={e => { e.stopPropagation(); setImgOpen(false) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="captura" className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: '0 0 80px rgba(244,114,194,0.15)' }} />
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
      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{secret && !show ? '••••••••••' : value}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover/copy:opacity-100 transition-opacity">
        {secret && (
          <button onClick={() => setShow(s => !s)} className="text-[10px] transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#34D399' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}>
            {show ? 'ocultar' : 'ver'}
          </button>
        )}
        <button onClick={copy} className="transition-colors cursor-pointer" style={{ color: 'var(--text-faint)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22D3EE' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}>
          {copied ? <Check className="w-3 h-3" style={{ color: '#34D399' }} /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  )
}

function DataBlock({ icon, label, value, secret, link, accent = 'var(--text-muted)' }: {
  icon: React.ReactNode; label: string; value: string; secret?: boolean; link?: boolean; accent?: string
}) {
  return (
    <div className="flex items-baseline gap-1.5 text-xs min-w-0">
      <span className="shrink-0 inline-flex" style={{ color: accent }}>{icon}</span>
      <span className="shrink-0" style={{ color: 'var(--text-faint)' }}>{label}:</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 truncate transition-colors"
          style={{ color: '#22D3EE' }}>
          {value}
        </a>
      ) : secret ? (
        <CopyableValue value={value} secret />
      ) : (
        <span className="truncate" style={{ color: 'var(--text-muted)' }}>{value}</span>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>{children}</p>
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
      backgroundColor: enter ? 'rgba(255,255,255,0.04)' : 'transparent',
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
          borderColor: dragHandlers?.isDragOver ? 'rgba(244,114,194,0.5)' : 'var(--border-soft)',
          cursor: dragHandlers ? 'grab' : 'pointer',
          background: dragHandlers?.isDragOver ? 'rgba(244,114,194,0.05)' : undefined,
        }}
        onMouseEnter={() => handleRowHover(true)}
        onMouseLeave={() => handleRowHover(false)}
      >
        {/* Expand toggle + drag handle */}
        <td className="w-8 pl-3">
          <div className="flex items-center gap-0.5">
            {dragHandlers && (
              <GripVertical className="w-3 h-3 shrink-0 opacity-20 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-faint)' }} />
            )}
            <button
              onClick={e => { e.stopPropagation(); setExpanded(p => !p) }}
              className="p-1.5 rounded-lg transition-all cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,194,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
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
                  background: hasData ? '#34D399' : 'var(--text-faint)',
                  boxShadow: hasData ? '0 0 6px rgba(52,211,153,0.6)' : 'none',
                }}
              />
              <Link
                href={`/proyecto/${project.id}`}
                onClick={e => e.stopPropagation()}
                className="font-semibold text-sm hover:underline underline-offset-2"
                style={{ color: 'var(--text)' }}
              >
                {project.nombre}
              </Link>
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22D3EE' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {project.maquetador && (
              <span className="text-[11px] ml-3.5" style={{ color: 'var(--text-faint)' }}>{project.maquetador}</span>
            )}
          </div>
        </td>

        {/* Plugins */}
        <td className="px-3 py-3 hidden md:table-cell">
          {project.plugins.length > 0 ? (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.plugins.length}</span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>
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
            ? <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.estabilidad_diseno}</span>
            : <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
        </td>

        {/* Formularios */}
        <td className="px-3 py-3 hidden xl:table-cell">
          {m?.pruebas_formularios
            ? <Badge variant={inferStatus(m.pruebas_formularios)}>{m.pruebas_formularios}</Badge>
            : <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
        </td>

        {/* Backup */}
        <td className="px-3 py-3 hidden xl:table-cell">
          {m?.backup
            ? <Badge variant={inferStatus(m.backup)}>{m.backup}</Badge>
            : <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
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
              'text-xs font-semibold cursor-pointer transition-opacity hover:opacity-75',
            )}
            style={{ color: 'var(--accent)' }}
          >
            {hasData ? 'Editar' : 'Registrar'}
          </button>
        </td>
      </tr>

      {/* Expanded panel */}
      {expanded && (
        <tr ref={expandRef} style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <td colSpan={11} className="px-4 py-5" style={{ background: 'rgba(11,7,19,0.6)' }}>

            {/* Archivar proyecto - arriba a la derecha */}
            <div className="flex justify-end mb-3">
              <button
                onClick={async () => {
                  if (!window.confirm('¿Archivar este proyecto? Desaparecerá del dashboard pero se puede restaurar.')) return
                  await archiveProject(project.id, true).catch(console.error)
                  onRefresh()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-soft)', color: 'var(--text-faint)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F59E0B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)' }}
              >
                <Archive className="w-3 h-3" />
                Archivar proyecto
              </button>
            </div>

            {/* Compact detail panel — one glass card, one grid, no boxed sub-cards */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-5">

                {/* Acceso */}
                {(project.link_acceso_editor || project.usuario || project.clave || project.dominio || project.autenticador || project.vencimiento_dominio) && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <SectionLabel>Acceso</SectionLabel>
                    {project.dominio         && <DataBlock icon={<Globe className="w-3.5 h-3.5" />}         label="Dominio"     value={project.dominio} accent="#22D3EE" />}
                    {project.link_acceso_editor && <DataBlock icon={<ExternalLink className="w-3.5 h-3.5" />} label="Editor"    value={project.link_acceso_editor} link accent="#22D3EE" />}
                    {project.usuario         && <DataBlock icon={<User className="w-3.5 h-3.5" />}          label="Usuario"     value={project.usuario} accent="#F59E0B" />}
                    {project.clave           && <DataBlock icon={<Key className="w-3.5 h-3.5" />}           label="Clave"       value={project.clave} secret accent="#F87171" />}
                    {project.autenticador    && <DataBlock icon={<Shield className="w-3.5 h-3.5" />}        label="Auth"        value={project.autenticador} accent="#A78BFA" />}
                    {project.vencimiento_dominio && <DataBlock icon={<Calendar className="w-3.5 h-3.5" />}  label="Vence"       value={project.vencimiento_dominio} accent="#F472C2" />}
                  </div>
                )}

                {/* Configuración */}
                {(project.licencias || project.figma_url || project.ceco) && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <SectionLabel>Configuración</SectionLabel>
                    {project.ceco       && <DataBlock icon={<FileText className="w-3.5 h-3.5" />} label="CECO"      value={project.ceco} />}
                    {project.licencias  && <DataBlock icon={<FileText className="w-3.5 h-3.5" />} label="Licencias" value={project.licencias} accent="#22D3EE" />}
                    {project.figma_url  && <DataBlock icon={<Sigma className="w-3.5 h-3.5" />}    label="Figma"     value={project.figma_url} link accent="#A78BFA" />}
                  </div>
                )}

                {/* Plugins */}
                {project.plugins.length > 0 && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <SectionLabel>Plugins · {project.plugins.length}</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {project.plugins.map(p => (
                        <span key={p}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Redirects de formularios */}
                {project.redirects && project.redirects.length > 0 && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <SectionLabel>Redirects · {project.redirects.length}</SectionLabel>
                    {project.redirects.map((r, i) => (
                      r.url ? (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" title={r.url}
                          className="text-xs underline underline-offset-2 truncate transition-colors"
                          style={{ color: '#22D3EE' }}>
                          {r.nombre || r.url}
                        </a>
                      ) : (
                        <span key={i} className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.nombre}</span>
                      )
                    ))}
                  </div>
                )}

                {/* Monitoreo */}
                {m && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <SectionLabel>Monitoreo · {m.fecha}</SectionLabel>
                    {m.backup              && <DataBlock icon={<HardDrive className="w-3.5 h-3.5" />}       label="Backup"      value={m.backup} accent="#34D399" />}
                    {m.pruebas_formularios && <DataBlock icon={<MessageSquare className="w-3.5 h-3.5" />}   label="Formularios" value={m.pruebas_formularios} accent="#A78BFA" />}
                    {m.estabilidad_diseno  && <DataBlock icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Estabilidad" value={m.estabilidad_diseno} accent="#22D3EE" />}
                    {m.notas               && <DataBlock icon={<FileText className="w-3.5 h-3.5" />}        label="Notas"       value={m.notas ?? ''} />}
                    {m.tareas_ejecutar     && <DataBlock icon={<ListTodo className="w-3.5 h-3.5" />}        label="Tareas"      value={m.tareas_ejecutar ?? ''} accent="#F59E0B" />}
                  </div>
                )}
              </div>
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
