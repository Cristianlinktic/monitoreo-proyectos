'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !panelRef.current) return
    gsap.fromTo(panelRef.current,
      { y: 24, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
    )
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(6,3,12,0.75)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn('relative w-full rounded-2xl overflow-hidden', sizes[size])}
        style={{
          background: 'rgba(20,12,34,0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 90px rgba(124,58,237,0.18)',
          maxHeight: '90vh',
        }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent-2) 70%, transparent 100%)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all cursor-pointer"
            style={{ color: 'var(--text-faint)', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 72px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
