'use client'

import { cn } from '@/lib/utils'

type Variant = 'ok' | 'warning' | 'critical' | 'pending' | 'info' | 'default'

const variants: Record<Variant, { cls: string; glow: string }> = {
  ok:       { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', glow: '0 0 8px rgba(34,197,94,0.3)' },
  warning:  { cls: 'bg-amber-500/10  text-amber-400  border-amber-500/25',    glow: '0 0 8px rgba(245,158,11,0.3)' },
  critical: { cls: 'bg-red-500/10    text-red-400    border-red-500/25',      glow: '0 0 8px rgba(239,68,68,0.3)' },
  pending:  { cls: 'bg-slate-800/60  text-slate-500  border-slate-700/40',    glow: 'none' },
  info:     { cls: 'bg-blue-500/10   text-blue-400   border-blue-500/25',     glow: '0 0 8px rgba(59,130,246,0.3)' },
  default:  { cls: 'bg-slate-800/40  text-slate-400  border-slate-700/30',    glow: 'none' },
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const v = variants[variant]
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border', v.cls, className)}
      style={{ boxShadow: v.glow }}
    >
      {children}
    </span>
  )
}
