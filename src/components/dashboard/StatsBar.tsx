'use client'

import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import type { ProjectWithMonitoring } from '@/lib/types'

interface StatsBarProps {
  projects: ProjectWithMonitoring[]
  selectedDate: string
}

export function StatsBar({ projects, selectedDate }: StatsBarProps) {
  const total = projects.length
  const monitored = projects.filter((p) => p.monitoring).length
  const withTasks = projects.filter(
    (p) => p.monitoring?.tareas_ejecutar?.trim()
  ).length
  const pendientes = total - monitored

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const stats = [
    {
      label: 'Total proyectos',
      value: total,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Monitoreados',
      value: monitored,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Con tareas pendientes',
      value: withTasks,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: isToday ? 'Sin revisar hoy' : 'Sin datos ese día',
      value: pendientes,
      icon: Clock,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className="flex items-center gap-3 p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]"
          >
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-[#F8FAFC]">{s.value}</p>
              <p className="text-xs text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
