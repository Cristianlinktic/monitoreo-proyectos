'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, PieChart as PieIcon } from 'lucide-react'
import { getCoverageStats } from '@/services/monitoring.service'
import type { ProjectWithMonitoring } from '@/lib/types'

interface MetricsPanelProps {
  projects: ProjectWithMonitoring[]
  totalProjects: number
}

const RADIAN = Math.PI / 180
function CustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: {
  cx?: number; cy?: number; midAngle?: number
  innerRadius?: number; outerRadius?: number; percent?: number
}) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#F8FAFC" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="text-[#94A3B8] text-[11px] mb-1">{label}</p>
      <p className="text-emerald-400 font-semibold">{payload[0].value} proyectos</p>
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
    { name: 'Monitoreados sin tareas', value: noTask,   color: '#22C55E' },
    { name: 'Con tareas pendientes',   value: withTasks, color: '#F59E0B' },
    { name: 'Sin revisar',             value: pending,   color: '#1E293B' },
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
        style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid #1E293B' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', transform: 'translate(30%, -30%)' }} />

        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-[#F8FAFC]">Cobertura de monitoreo</p>
            <p className="text-[11px] text-[#475569]">Proyectos monitoreados por día (últimos 30)</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="fecha"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="monitored"
                stroke="#06B6D4"
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-[#334155] text-sm">
            Sin datos históricos aún
          </div>
        )}
      </div>

      {/* Donut — estado del día */}
      <div className="rounded-2xl p-5 relative overflow-hidden flex flex-col"
        style={{ background: 'rgba(8,13,26,0.9)', border: '1px solid #1E293B' }}>
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22C55E, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <PieIcon className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-[#F8FAFC]">Estado del día</p>
            <p className="text-[11px] text-[#475569]">Distribución actual</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {totalProjects > 0 ? (
            <div className="relative w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={CustomLabel}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color}
                        style={{ filter: entry.color !== '#1E293B' ? `drop-shadow(0 0 6px ${entry.color}80)` : 'none' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: 0, height: 140 }}>
                <span className="text-2xl font-heading font-bold text-emerald-400" style={{ textShadow: '0 0 20px rgba(34,197,94,0.5)' }}>
                  {totalProjects > 0 ? Math.round((monitored / totalProjects) * 100) : 0}%
                </span>
                <span className="text-[10px] text-[#475569]">cobertura</span>
              </div>
            </div>
          ) : (
            <div className="text-[#334155] text-sm">Sin proyectos</div>
          )}
        </div>

        {/* Leyenda */}
        <div className="flex flex-col gap-1.5 mt-2">
          {donutData.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color, boxShadow: d.color !== '#1E293B' ? `0 0 6px ${d.color}` : 'none' }} />
                <span className="text-[11px] text-[#64748B]">{d.name}</span>
              </div>
              <span className="text-[11px] font-medium text-[#94A3B8]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
