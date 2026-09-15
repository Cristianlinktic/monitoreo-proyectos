'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DURATION, EASE, STAGGER } from '@/lib/motion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type RevealWordsProps = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  wordClassName?: string
  delay?: number
}

export function RevealWords({ text, as: Tag = 'p', className, wordClassName, delay = 0 }: RevealWordsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<any>(null)
  const words = text.split(' ')

  useLayoutEffect(() => {
    const container = containerRef.current as HTMLElement | null
    if (!container) return

    const wordEls = container.querySelectorAll<HTMLElement>('[data-word]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(wordEls, { y: 0, opacity: 1 })
      return
    }

    gsap.set(wordEls, { y: 24, opacity: 0 })

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(wordEls, {
            y: 0,
            opacity: 1,
            duration: DURATION.wordReveal,
            ease: EASE.outQuart,
            stagger: STAGGER.word,
            delay,
          })
        },
      })
    }, container)

    return () => ctx.revert()
  }, [delay])

  return (
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <span data-word className={wordClassName} style={{ display: 'inline-block' }}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}
