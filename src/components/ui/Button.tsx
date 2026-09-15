'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:   'text-white font-semibold',
  secondary: 'bg-[var(--bg-muted)] hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-[var(--border)] hover:border-white/25',
  ghost:     'hover:bg-white/8 text-[var(--text-faint)] hover:text-white',
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
        'focus:outline-none focus:ring-2 focus:ring-[rgba(244,114,194,0.4)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={isPrimary ? {
        fontFamily: 'var(--font-heading)',
        background: 'var(--accent-gradient)',
        boxShadow: '0 0 16px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)',
      } : undefined}
      onMouseEnter={e => { if (isPrimary) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(244,114,194,0.55), 0 2px 8px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { if (isPrimary) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)' }}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}
