'use client'

import { healthColor } from '@/lib/health'

interface HealthRingProps {
  score: number
  size?: number
  radius?: number
  stroke?: number
}

export function HealthRing({ score, size = 36, radius = 14, stroke = 2.5 }: HealthRingProps) {
  const color = healthColor(score)
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  const dashOffset = circumference * (1 - progress)
  const center = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <filter id={`glow-${score}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke="#1E293B"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      {score > 0 && (
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter={score > 0 ? `url(#glow-${score}-${size})` : undefined}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      )}
      {/* Score text — counter-rotate so text is upright */}
      {score > 0 && (
        <text
          x={center} y={center}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${center}px ${center}px`,
            fill: color,
            fontSize: size <= 36 ? '9px' : '13px',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {score}
        </text>
      )}
    </svg>
  )
}
