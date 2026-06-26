'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:   'text-[#020617] font-semibold',
  secondary: 'bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#334155]',
  ghost:     'hover:bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC]',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-all duration-150 cursor-pointer active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={isPrimary ? {
        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        boxShadow: '0 0 16px rgba(34,197,94,0.3), 0 2px 8px rgba(0,0,0,0.4)',
      } : undefined}
      onMouseEnter={e => { if (isPrimary) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(34,197,94,0.5), 0 2px 8px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { if (isPrimary) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(34,197,94,0.3), 0 2px 8px rgba(0,0,0,0.4)' }}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}
