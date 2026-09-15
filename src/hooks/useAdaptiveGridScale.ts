'use client'

import { useEffect, type RefObject } from 'react'
import { ADAPTIVE_GRID } from '@/lib/motion'

export function useAdaptiveGridScale<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    function apply() {
      const el = ref.current
      if (!el) return
      const { fontBase, baseWidth, coef } = ADAPTIVE_GRID
      const w = window.innerWidth
      const widthReduction = ((baseWidth - w) / baseWidth) * 100
      const size = fontBase - (fontBase * (widthReduction * coef)) / 100
      if (size > fontBase) el.style.fontSize = `${size}px`
      else el.style.removeProperty('font-size')
    }

    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [ref])
}
