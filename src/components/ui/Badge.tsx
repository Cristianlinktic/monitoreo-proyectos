'use client'

type Variant = 'ok' | 'warning' | 'critical' | 'pending' | 'info' | 'default'

const variants: Record<Variant, { bg: string; color: string }> = {
  ok:       { bg: 'rgba(52,211,153,0.15)',  color: '#34D399' },
  warning:  { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  critical: { bg: 'rgba(248,113,113,0.15)', color: '#F87171' },
  pending:  { bg: 'rgba(154,143,190,0.15)', color: '#9A8FBE' },
  info:     { bg: 'rgba(34,211,238,0.15)',  color: '#22D3EE' },
  default:  { bg: 'rgba(255,255,255,0.06)', color: '#7A6E99' },
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
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${className ?? ''}`}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  )
}
