'use client'

import { cn } from '@/lib/utils'

type Variant = 'ok' | 'warning' | 'critical' | 'pending' | 'info' | 'default'

const variants: Record<Variant, string> = {
  ok:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  pending:  'bg-slate-500/15 text-slate-400 border-slate-500/20',
  info:     'bg-blue-500/15 text-blue-400 border-blue-500/20',
  default:  'bg-slate-700/50 text-slate-300 border-slate-600/30',
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
