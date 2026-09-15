'use client'

import { useEffect, useRef } from 'react'

const BLOB_PARALLAX_SPEED = [10, 16, 22]

export function GooeyBlobField() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleMouseMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      blobRefs.current.forEach((blob, i) => {
        if (!blob) return
        const speed = BLOB_PARALLAX_SPEED[i]
        blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="aurora-blobs" aria-hidden="true">
      <div
        ref={el => { blobRefs.current[0] = el }}
        className="aurora-blob aurora-blob-magenta"
        style={{ transition: 'transform 0.2s ease-out' }}
      />
      <div
        ref={el => { blobRefs.current[1] = el }}
        className="aurora-blob aurora-blob-violet"
        style={{ transition: 'transform 0.2s ease-out' }}
      />
      <div
        ref={el => { blobRefs.current[2] = el }}
        className="aurora-blob aurora-blob-cyan"
        style={{ transition: 'transform 0.2s ease-out' }}
      />
    </div>
  )
}
