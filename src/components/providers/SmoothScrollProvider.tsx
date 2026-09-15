'use client'

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'

type SmoothScrollApi = {
  stop: () => void
  start: () => void
  scrollTo: (id: string) => void
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)

function lockHtmlScroll() {
  const html = document.documentElement
  html.style.position = 'relative'
  html.style.overflow = 'hidden'
  html.style.height = '100%'
}

function unlockHtmlScroll() {
  const html = document.documentElement
  html.style.removeProperty('position')
  html.style.removeProperty('overflow')
  html.style.removeProperty('height')
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ smoothWheel: true })
    lenisRef.current = lenis

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const api = useMemo<SmoothScrollApi>(
    () => ({
      stop: () => {
        lenisRef.current?.stop()
        lockHtmlScroll()
      },
      start: () => {
        lenisRef.current?.start()
        unlockHtmlScroll()
      },
      scrollTo: (id: string) => {
        const el = document.getElementById(id)
        if (!el) return
        lenisRef.current?.stop()
        lockHtmlScroll()
        window.setTimeout(() => {
          const top = el.getBoundingClientRect().top + window.pageYOffset
          window.scrollTo({ top, behavior: 'smooth' })
        }, 50)
        window.setTimeout(() => {
          lenisRef.current?.start()
          unlockHtmlScroll()
        }, 100)
      },
    }),
    []
  )

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used within SmoothScrollProvider')
  return ctx
}
