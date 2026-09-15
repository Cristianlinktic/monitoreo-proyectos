'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { getCoverageStats } from '@/services/monitoring.service'
import type { ProjectWithMonitoring } from '@/lib/types'

interface MetricsPanelProps {
  projects: ProjectWithMonitoring[]
  totalProjects: number
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-semibold" style={{ color: '#22D3EE' }}>{payload[0].value} proyectos</p>
    </div>
  )
}

export function MetricsPanel({ projects, totalProjects }: MetricsPanelProps) {
  const [coverage, setCoverage] = useState<{ fecha: string; monitored: number }[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getCoverageStats().then(setCoverage).catch(console.error)
  }, [])

  const monitored  = projects.filter(p => p.monitoring).length
  const withTasks  = projects.filter(p => p.monitoring?.tareas_ejecutar?.trim()).length
  const pending    = totalProjects - monitored
  const noTask     = monitored - withTasks

  const donutData = [
    { name: 'Monitoreados sin tareas', value: noTask,   color: '#34D399' },
    { name: 'Con tareas pendientes',   value: withTasks, color: '#F59E0B' },
    { name: 'Sin revisar',             value: pending,   color: '#4B4560' },
  ].filter(d => d.value > 0)

  const chartData = coverage.map(d => ({
    fecha: d.fecha.slice(5),
    monitored: d.monitored,
  }))

  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Area chart — cobertura histórica */}
      <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22D3EE, transparent)', transform: 'translate(30%, -30%)' }} />

        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#22D3EE' }} />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold" style={{ color: 'var(--text)' }}>Cobertura de monitoreo</p>
            <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>Proyectos monitoreados por día (últimos 30)</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="fecha"
                tick={{ fill: '#7A6E99', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#7A6E99', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="monitored"
                stroke="#22D3EE"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#22D3EE', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: 'var(--text-faint)' }}>
            Sin datos históricos aún
          </div>
        )}
      </div>

      {/* Donut — estado del día */}
      <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col items-center"
        style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)' }}>
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)', transform: 'translate(-30%, 30%)' }} />

        <p className="self-start mb-[18px] font-heading font-semibold text-sm" style={{ color: '#FFFFFF' }}>Estado del día</p>

        {totalProjects > 0 ? (
          <>
            <div className="relative" style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={41}
                    outerRadius={55}
                    paddingAngle={0}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-heading font-bold" style={{ color: '#FFFFFF', fontSize: 22 }}>
                  {Math.round((monitored / totalProjects) * 100)}%
                </span>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap justify-center gap-3.5 mt-4">
              {donutData.map(d => (
                <span key={d.name} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9A8FBE' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  {d.name} · {d.value}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center text-sm" style={{ color: 'var(--text-faint)' }}>Sin proyectos</div>
        )}
      </div>
    </div>
  )
}
