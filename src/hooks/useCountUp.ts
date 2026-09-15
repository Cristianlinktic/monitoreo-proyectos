'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCountUp(target: number) {
  const ref = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
      onUpdate: (self) => setValue(Math.round(self.progress * target)),
    })

    return () => trigger.kill()
  }, [target])

  return { ref, value }
}
