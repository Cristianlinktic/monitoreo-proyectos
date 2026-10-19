'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Globe, Calendar, ExternalLink, Cpu, FileText, Sigma,
  HardDrive, Package, CheckCircle2, ListTodo,
} from 'lucide-react'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { getProjects } from '@/services/projects.service'
import { getProjectHistory } from '@/services/monitoring.service'
import { HealthRing } from '@/components/dashboard/HealthRing'
import { TasksPanel } from '@/components/dashboard/TasksPanel'
import { computeHealth, healthColor } from '@/lib/health'
import type { Project, MonitoringEntry } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const panelStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border)',
}

function InfoField({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</span>
      </div>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-[13px] underline underline-offset-2 truncate transition-colors"
          style={{ color: 'var(--accent)' }}>
          {value}
        </a>
      ) : (
        <p className="text-[13px] break-words" style={{ color: 'var(--text-muted)' }}>{value}</p>
      )}
    </div>
  )
}

function MonitoringCard({ entry }: { entry: MonitoringEntry }) {
  const score = computeHealth(entry)
  const color = healthColor(score)
  return (
    <div className="flex gap-4 p-4 rounded-[14px]" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-soft)' }}>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <HealthRing score={score} size={36} radius={13} stroke={2.5} />
        <span className="text-[9px] font-mono whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>{entry.fecha}</span>
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-0">
        {entry.estabilidad_diseno && (
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Estabilidad</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.estabilidad_diseno}</p>
          </div>
        )}
        {entry.pruebas_formularios && (
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Formularios</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.pruebas_formularios}</p>
          </div>
        )}
        {entry.backup && (
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Backup</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.backup}</p>
          </div>
        )}
        {entry.rendimiento_score && (
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Rendimiento</p>
            <p className="text-xs font-semibold" style={{ color }}>{entry.rendimiento_score}</p>
          </div>
        )}
        {entry.tareas_ejecutar && (
          <div className="col-span-2">
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Tareas</p>
            <p className="text-xs" style={{ color: 'var(--amber)' }}>{entry.tareas_ejecutar}</p>
          </div>
        )}
        {entry.notas && (
          <div className="col-span-2">
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Notas</p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{entry.notas}</p>
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
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([getProjects(), getProjectHistory(id)])
      .then(([projects, hist]) => {
        setProject(projects.find(p => p.id === id) ?? null)
        setHistory(hist)
      })
      .finally(() => setLoading(false))
  }, [id, user])

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-faint)' }}>Proyecto no encontrado</p>
        <button onClick={() => router.push('/')} className="text-sm underline cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="aurora-blobs">
        <div className="aurora-blob aurora-blob-magenta" />
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-cyan" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6" style={{ zIndex: 1 }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al dashboard
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-wrap items-center justify-between gap-5 mb-5 p-6 rounded-[20px]" style={panelStyle}>
          <div className="flex items-center gap-5 min-w-0">
            <HealthRing score={score} size={64} radius={26} stroke={3.5} />
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight mb-1.5 truncate" style={{ color: 'var(--text)' }}>
                {project.nombre}
              </h1>
              <p className="text-[13px] mb-1 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                {project.maquetador && <span>Maquetador: {project.maquetador}</span>}
                {project.maquetador && project.url && <span style={{ color: 'var(--text-faint)' }}>·</span>}
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--accent)' }}>
                    <ExternalLink className="w-3 h-3" />
                    {project.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {history.length} registro{history.length !== 1 ? 's' : ''} de monitoreo
              </p>
            </div>
          </div>
          <span className="text-[13px] px-4 py-2 rounded-full font-semibold shrink-0"
            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
            Health {score}/100
          </span>
        </div>

        {/* Info grid + plugins/redirects */}
        {(project.dominio || project.vencimiento_dominio || project.ceco || project.figma_url || project.licencias || project.plugins.length > 0 || (project.redirects && project.redirects.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-5">
            {(project.dominio || project.vencimiento_dominio || project.ceco || project.figma_url || project.licencias) && (
              <div className="p-6 rounded-[20px]" style={panelStyle}>
                <p className="text-[13px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Información</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {project.dominio && <InfoField icon={<Globe className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />} label="Dominio" value={project.dominio} />}
                  {project.vencimiento_dominio && <InfoField icon={<Calendar className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} />} label="Vencimiento dom." value={project.vencimiento_dominio} />}
                  {project.ceco && <InfoField icon={<FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />} label="CECO" value={project.ceco} />}
                  {project.figma_url && <InfoField icon={<Sigma className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />} label="Figma" value={project.figma_url} link />}
                  {project.licencias && <InfoField icon={<FileText className="w-3.5 h-3.5" style={{ color: 'var(--violet)' }} />} label="Licencias" value={project.licencias} />}
                </div>
              </div>
            )}

            {(project.plugins.length > 0 || (project.redirects && project.redirects.length > 0)) && (
              <div className="p-6 rounded-[20px]" style={panelStyle}>
                {project.plugins.length > 0 && (
                  <div className={project.redirects && project.redirects.length > 0 ? 'mb-5' : ''}>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Plugins · {project.plugins.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.plugins.map(p => (
                        <span key={p} className="text-[11px] px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.redirects && project.redirects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Redirects · {project.redirects.length}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {project.redirects.map((r, i) => (
                        r.url ? (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" title={r.url}
                            className="text-xs underline underline-offset-2 truncate w-fit max-w-full transition-colors"
                            style={{ color: 'var(--accent)' }}>
                            {r.nombre || r.url}
                          </a>
                        ) : (
                          <p key={i} className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.nombre}</p>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rendimiento chart */}
        {chartData.length > 1 && (
          <div className="mb-5 p-6 rounded-[20px]" style={panelStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Rendimiento histórico</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: '#7A6E99' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#7A6E99' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,12,34,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11 }}
                  labelStyle={{ color: '#C9B8E8' }}
                  itemStyle={{ color: '#22D3EE' }}
                />
                <Area type="monotone" dataKey="value" stroke="#22D3EE" strokeWidth={2} fill="url(#rendGrad)" dot={false} activeDot={{ r: 3, fill: '#22D3EE' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tasks */}
        <div className="mb-5 p-6 rounded-[20px]" style={panelStyle}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Tareas</span>
          </div>
          <TasksPanel projectId={id} />
        </div>

        {/* Timeline */}
        <div className="p-6 rounded-[20px]" style={panelStyle}>
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Historial de monitoreo</span>
            <span className="ml-auto text-[11px]" style={{ color: 'var(--text-faint)' }}>{history.length} registro{history.length !== 1 ? 's' : ''}</span>
          </div>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <HardDrive className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Sin registros de monitoreo aún</p>
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
