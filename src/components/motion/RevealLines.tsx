'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DURATION, EASE, STAGGER } from '@/lib/motion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type RevealLinesProps = {
  lines: string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  lineClassName?: string
  delay?: number
  stagger?: number
  active?: boolean
}

export function RevealLines({
  lines,
  as: Tag = 'h2',
  className,
  lineClassName,
  delay = 0,
  stagger = STAGGER.line,
  active = true,
}: RevealLinesProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<any>(null)

  useLayoutEffect(() => {
    const container = containerRef.current as HTMLElement | null
    if (!container || !active) return

    const innerEls = container.querySelectorAll<HTMLElement>('[data-line-inner]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(innerEls, { y: '0%', opacity: 1 })
      return
    }

    gsap.set(innerEls, { y: '100%', opacity: 0 })

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(innerEls, {
            y: '0%',
            opacity: 1,
            duration: DURATION.lineReveal,
            ease: EASE.outCubic,
            stagger,
            delay,
          })
        },
      })
    }, container)

    return () => ctx.revert()
  }, [active, delay, stagger])

  return (
    <Tag ref={containerRef} className={className}>
      {lines.map((line, i) => (
        <span key={i} data-line-mask style={{ display: 'block', overflow: 'hidden' }}>
          <span data-line-inner className={lineClassName} style={{ display: 'block' }}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
