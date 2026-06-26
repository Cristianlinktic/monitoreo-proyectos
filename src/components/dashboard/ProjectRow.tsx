'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Shield,
  LayoutDashboard,
  MessageSquare,
  HardDrive,
  FileText,
  ListTodo,
  Edit3,
  Plus,
  Package,
  ExternalLink,
  Globe,
  User,
  Key,
  Calendar,
  Sigma,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProjectEditModal } from './ProjectEditModal'
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

function StatusCell({ value, showImage, imageUrl }: {
  value: string | null
  showImage?: boolean
  imageUrl?: string | null
}) {
  const [imgOpen, setImgOpen] = useState(false)

  if (!value && !imageUrl) {
    return <Badge variant="pending">—</Badge>
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {imageUrl && (
        <>
          <button
            onClick={() => setImgOpen(true)}
            className="relative group cursor-pointer"
            aria-label="Ver imagen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="captura"
              className="w-8 h-8 rounded object-cover border border-[#1E293B] group-hover:border-emerald-500/40 transition-colors"
            />
          </button>
          {imgOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setImgOpen(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="captura" className="max-w-full max-h-full rounded-xl" />
            </div>
          )}
        </>
      )}
      {value && <Badge variant={inferStatus(value)}>{value}</Badge>}
    </div>
  )
}

interface ProjectRowProps {
  project: ProjectWithMonitoring
  selectedDate: string
  onRefresh: () => void
}

export function ProjectRow({ project, selectedDate, onRefresh }: ProjectRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const m = project.monitoring

  const hasData = !!m

  return (
    <>
      {/* Row */}
      <tr className={cn(
        'border-b border-[#1E293B] transition-colors',
        'hover:bg-[#0F172A]/60',
        expanded && 'bg-[#0F172A]/40'
      )}>
        {/* Expand */}
        <td className="w-8 pl-3">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </td>

        {/* Nombre + maquetador */}
        <td className="px-3 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-[#F8FAFC]">{project.nombre}</span>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#475569] hover:text-emerald-400 transition-colors"
                  aria-label="Abrir URL"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {project.maquetador && (
              <span className="text-xs text-[#475569]">{project.maquetador}</span>
            )}
          </div>
        </td>

        {/* Plugins count */}
        <td className="px-3 py-3 hidden md:table-cell">
          {project.plugins.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
              <Package className="w-3 h-3" />
              {project.plugins.length}
            </span>
          ) : (
            <span className="text-xs text-[#334155]">—</span>
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
            ? <span className="text-xs text-[#CBD5E1]">{m.estabilidad_diseno}</span>
            : <span className="text-xs text-[#334155]">—</span>}
        </td>

        {/* Formularios */}
        <td className="px-3 py-3 hidden xl:table-cell">
          <StatusCell value={m?.pruebas_formularios ?? null} />
        </td>

        {/* Backup */}
        <td className="px-3 py-3 hidden xl:table-cell">
          <StatusCell value={m?.backup ?? null} />
        </td>

        {/* Estado general */}
        <td className="px-3 py-3">
          {hasData
            ? <Badge variant="ok">Monitoreado</Badge>
            : <Badge variant="pending">Pendiente</Badge>}
        </td>

        {/* Acciones */}
        <td className="px-3 py-3">
          <Button
            size="sm"
            variant={hasData ? 'secondary' : 'primary'}
            onClick={() => setEditOpen(true)}
            className="whitespace-nowrap"
          >
            {hasData
              ? <><Edit3 className="w-3 h-3" /> Editar</>
              : <><Plus className="w-3 h-3" /> Registrar</>}
          </Button>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="border-b border-[#1E293B] bg-[#0A0F1E]">
          <td colSpan={10} className="px-6 py-5">
            <div className="flex flex-col gap-5">

              {/* Acceso */}
              {(project.link_acceso_editor || project.usuario || project.dominio) && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] uppercase tracking-widest mb-3">Acceso</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {project.dominio       && <DetailBlock icon={<ExternalLink className="w-3.5 h-3.5 text-blue-400" />}    label="Dominio"    value={project.dominio} />}
                    {project.link_acceso_editor && <DetailBlock icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}   label="Editor"     value={project.link_acceso_editor} />}
                    {project.usuario       && <DetailBlock icon={<User className="w-3.5 h-3.5 text-amber-400" />}           label="Usuario"    value={project.usuario} />}
                    {project.clave         && <DetailBlock icon={<Key className="w-3.5 h-3.5 text-red-400" />}              label="Clave"      value={project.clave} secret />}
                    {project.autenticador  && <DetailBlock icon={<Shield className="w-3.5 h-3.5 text-purple-400" />}        label="Auth"       value={project.autenticador} />}
                    {project.vencimiento_dominio && <DetailBlock icon={<Calendar className="w-3.5 h-3.5 text-orange-400" />} label="Vencimiento" value={project.vencimiento_dominio} />}
                  </div>
                </div>
              )}

              {/* Configuración */}
              {(project.licencias || project.figma_url) && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] uppercase tracking-widest mb-3">Configuración</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.licencias  && <DetailBlock icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}   label="Licencias" value={project.licencias} />}
                    {project.figma_url  && <DetailBlock icon={<Sigma className="w-3.5 h-3.5 text-purple-400" />}   label="Figma"     value={project.figma_url} link />}
                  </div>
                </div>
              )}

              {/* Plugins */}
              {project.plugins.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] uppercase tracking-widest mb-3">Plugins ({project.plugins.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.plugins.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-[#1E293B] text-[#94A3B8] border border-[#334155]">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoreo */}
              {m && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] uppercase tracking-widest mb-3">Monitoreo — {m.fecha}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {m.notas               && <DetailBlock icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}       label="Notas"             value={m.notas ?? ''} />}
                    {m.tareas_ejecutar     && <DetailBlock icon={<ListTodo className="w-3.5 h-3.5 text-amber-400" />}      label="Tareas a ejecutar" value={m.tareas_ejecutar ?? ''} />}
                    {m.backup              && <DetailBlock icon={<HardDrive className="w-3.5 h-3.5 text-emerald-400" />}   label="Backup"            value={m.backup ?? ''} />}
                    {m.pruebas_formularios && <DetailBlock icon={<MessageSquare className="w-3.5 h-3.5 text-purple-400" />}label="Formularios"       value={m.pruebas_formularios ?? ''} />}
                    {m.estabilidad_diseno  && <DetailBlock icon={<LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />}label="Estabilidad"      value={m.estabilidad_diseno ?? ''} />}
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

function DetailBlock({ icon, label, value, secret, link }: {
  icon: React.ReactNode
  label: string
  value: string
  secret?: boolean
  link?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</span>
      </div>
      {secret ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#CBD5E1] font-mono">
            {show ? value : '••••••••••••'}
          </p>
          <button onClick={() => setShow(s => !s)}
            className="text-xs text-[#475569] hover:text-emerald-400 transition-colors cursor-pointer">
            {show ? 'ocultar' : 'mostrar'}
          </button>
        </div>
      ) : link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-sm text-emerald-400 hover:text-emerald-300 underline truncate transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-sm text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">{value}</p>
      )}
    </div>
  )
}
