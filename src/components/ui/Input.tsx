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
          <label htmlFor={inputId} className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155]',
            'focus:outline-none transition-all duration-150',
            error && 'ring-1 ring-red-500/50',
            className
          )}
          style={{
            background: 'rgba(3,7,18,0.8)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(30,41,59,0.7)'}`,
            ...style,
          }}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'
              e.currentTarget.style.boxShadow = '0 0 12px rgba(34,197,94,0.08)'
            }
          }}
          onBlur={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'rgba(30,41,59,0.7)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
          {...props}
        />
        {helper && !error && <p className="text-[11px] text-[#334155]">{helper}</p>}
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
