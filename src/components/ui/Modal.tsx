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
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn('relative w-full rounded-2xl overflow-hidden', sizes[size])}
        style={{
          background: 'rgba(5,10,20,0.97)',
          border: '1px solid rgba(30,41,59,0.8)',
          boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(34,197,94,0.05)',
          maxHeight: '90vh',
        }}
      >
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #22C55E 30%, #06B6D4 70%, transparent 100%)' }} />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-emerald-500/40 rounded-tl" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40 rounded-tr" />
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-emerald-500/20 rounded-bl" />
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/20 rounded-br" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22C55E, #06B6D4)', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }} />
            <h2 className="font-heading font-semibold text-base text-[#F8FAFC]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all cursor-pointer"
            style={{ color: '#475569', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
