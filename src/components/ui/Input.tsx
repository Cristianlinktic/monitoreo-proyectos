'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, style, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 rounded-[10px] text-sm text-white placeholder:text-[var(--text-faint)]',
            'focus:outline-none transition-all duration-150',
            error && 'ring-1 ring-red-500/50',
            className
          )}
          style={{
            background: 'rgba(0,0,0,0.28)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : 'var(--border)'}`,
            ...style,
          }}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'rgba(244,114,194,0.5)'
              e.currentTarget.style.boxShadow = '0 0 12px rgba(244,114,194,0.15)'
            }
          }}
          onBlur={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
          {...props}
        />
        {helper && !error && <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{helper}</p>}
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
