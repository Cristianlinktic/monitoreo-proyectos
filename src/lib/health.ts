import type { MonitoringEntry } from '@/lib/types'

export function computeHealth(m: MonitoringEntry | null | undefined): number {
  if (!m) return 0
  let score = 0
  if (m.ssl_imagen_url)          score += 20
  if (m.rendimiento_imagen_url)  score += 20
  if (m.estabilidad_diseno)      score += 20
  if (m.pruebas_formularios)     score += 20
  if (m.backup)                  score += 20
  return score
}

export function healthColor(score: number): string {
  if (score === 0)   return '#1E293B'
  if (score <= 49)   return '#EF4444'
  if (score <= 79)   return '#F59E0B'
  return '#22C55E'
}
