'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Globe, ExternalLink, Cpu, FileText, Sigma,
  HardDrive, MessageSquare, LayoutDashboard, ListTodo, Package, CheckCircle2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { getProjects } from '@/services/projects.service'
import { getProjectHistory } from '@/services/monitoring.service'
import { HealthRing } from '@/components/dashboard/HealthRing'
import { TasksPanel } from '@/components/dashboard/TasksPanel'
import { computeHealth, healthColor } from '@/lib/health'
import type { Project, MonitoringEntry } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

function InfoCard({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl"
      style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.6)' }}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">{label}</span>
      </div>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate">
          {value}
        </a>
      ) : (
        <p className="text-xs text-[#CBD5E1] break-words">{value}</p>
      )}
    </div>
  )
}

function MonitoringCard({ entry }: { entry: MonitoringEntry }) {
  const score = computeHealth(entry)
  const color = healthColor(score)
  return (
    <div className="flex gap-4 p-4 rounded-xl"
      style={{ background: 'rgba(8,13,26,0.7)', border: '1px solid rgba(30,41,59,0.5)' }}>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <HealthRing score={score} size={32} radius={11} stroke={2} />
        <span className="text-[9px] font-mono text-[#334155] whitespace-nowrap">{entry.fecha}</span>
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-0">
        {entry.estabilidad_diseno && (
          <div>
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Estabilidad</p>
            <p className="text-xs text-[#94A3B8]">{entry.estabilidad_diseno}</p>
          </div>
        )}
        {entry.pruebas_formularios && (
          <div>
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Formularios</p>
            <p className="text-xs text-[#94A3B8]">{entry.pruebas_formularios}</p>
          </div>
        )}
        {entry.backup && (
          <div>
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Backup</p>
            <p className="text-xs text-[#94A3B8]">{entry.backup}</p>
          </div>
        )}
        {entry.rendimiento_score && (
          <div>
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Rendimiento</p>
            <p className="text-xs font-semibold" style={{ color }}>{entry.rendimiento_score}</p>
          </div>
        )}
        {entry.tareas_ejecutar && (
          <div className="col-span-2">
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Tareas</p>
            <p className="text-xs text-amber-400">{entry.tareas_ejecutar}</p>
          </div>
        )}
        {entry.notas && (
          <div className="col-span-2">
            <p className="text-[9px] text-[#334155] uppercase tracking-wider mb-0.5">Notas</p>
            <p className="text-xs text-[#64748B]">{entry.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProyectoPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [history, setHistory] = useState<MonitoringEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProjects(), getProjectHistory(id)])
      .then(([projects, hist]) => {
        setProject(projects.find(p => p.id === id) ?? null)
        setHistory(hist)
      })
      .finally(() => setLoading(false))
  }, [id])

  const lastEntry = history.length > 0 ? history[history.length - 1] : null
  const score = computeHealth(lastEntry)
  const color = healthColor(score)

  const chartData = history
    .filter(e => e.rendimiento_score && !isNaN(parseFloat(e.rendimiento_score)))
    .map(e => ({
      fecha: e.fecha.slice(5), // MM-DD
      value: parseFloat(e.rendimiento_score!),
    }))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <p className="text-[#475569]">Proyecto no encontrado</p>
        <button onClick={() => router.push('/')} className="text-sm text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC]">
      {/* Bg orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute w-96 h-96 -top-32 -left-32 rounded-full blur-3xl opacity-[0.04]" style={{ background: color }} />
        <div className="absolute w-64 h-64 bottom-0 right-0 rounded-full blur-3xl opacity-[0.03]" style={{ background: '#06B6D4' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6" style={{ zIndex: 1 }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer"
            style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,41,59,0.7)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </button>
        </div>

        {/* Hero */}
        <div className="flex items-start gap-5 mb-8 p-6 rounded-2xl"
          style={{ background: 'rgba(8,13,26,0.9)', border: `1px solid ${color}25` }}>
          <HealthRing score={score} size={64} radius={26} stroke={3.5} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-tight mb-1" style={{ color: '#F8FAFC' }}>
              {project.nombre}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {project.maquetador && (
                <span className="text-[11px] text-[#475569]">{project.maquetador}</span>
              )}
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  {project.url.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                Health {score}/100
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[#334155] uppercase tracking-widest">Registros</p>
            <p className="text-3xl font-bold mt-0.5" style={{ color: '#22C55E' }}>{history.length}</p>
          </div>
        </div>

        {/* Project info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {project.dominio         && <InfoCard icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}     label="Dominio"    value={project.dominio} />}
          {project.vencimiento_dominio && <InfoCard icon={<Globe className="w-3.5 h-3.5 text-orange-400" />} label="Vencimiento dom." value={project.vencimiento_dominio} />}
          {project.ceco            && <InfoCard icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}  label="CECO"       value={project.ceco} />}
          {project.figma_url       && <InfoCard icon={<Sigma className="w-3.5 h-3.5 text-purple-400" />}   label="Figma"      value={project.figma_url} link />}
          {project.licencias       && <InfoCard icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}   label="Licencias"  value={project.licencias} />}
        </div>

        {/* Plugins */}
        {project.plugins.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl" style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-3.5 h-3.5 text-[#475569]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#334155]">Plugins · {project.plugins.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.plugins.map(p => (
                <span key={p} className="text-[11px] px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(30,41,59,0.7)', color: '#64748B' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Redirects de formularios */}
        {project.redirects && project.redirects.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl" style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-3.5 h-3.5 text-[#475569]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#334155]">Redirects de formularios · {project.redirects.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {project.redirects.map((r, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl"
                  style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.6)' }}>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Formulario</span>
                  </div>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" title={r.url}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate">
                      {r.nombre || r.url}
                    </a>
                  ) : (
                    <p className="text-xs text-[#CBD5E1] truncate">{r.nombre}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rendimiento chart */}
        {chartData.length > 1 && (
          <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-semibold text-[#F8FAFC]">Rendimiento histórico</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: '#334155' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#334155' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(5,10,20,0.97)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#64748B' }}
                  itemStyle={{ color: '#22C55E' }}
                />
                <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#rendGrad)" dot={false} activeDot={{ r: 3, fill: '#22C55E' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tasks */}
        <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#475569]" />
            <span className="text-sm font-semibold text-[#F8FAFC]">Tareas</span>
          </div>
          <TasksPanel projectId={id} />
        </div>

        {/* Timeline */}
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(30,41,59,0.7)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-3.5 h-3.5 text-[#475569]" />
            <span className="text-sm font-semibold text-[#F8FAFC]">Historial de monitoreo</span>
            <span className="ml-auto text-[11px] text-[#334155]">{history.length} registro{history.length !== 1 ? 's' : ''}</span>
          </div>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <HardDrive className="w-8 h-8 text-[#1E293B] mx-auto mb-3" />
              <p className="text-sm text-[#334155]">Sin registros de monitoreo aún</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...history].reverse().map(entry => (
                <MonitoringCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
