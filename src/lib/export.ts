import * as XLSX from 'xlsx'
import type { ProjectWithMonitoring } from '@/lib/types'
import { computeHealth } from '@/lib/health'

export function exportDayReport(projects: ProjectWithMonitoring[], fecha: string) {
  const rows = projects.map(p => ({
    'Proyecto':      p.nombre,
    'URL':           p.url ?? '',
    'Maquetador':    p.maquetador ?? '',
    'Health Score':  computeHealth(p.monitoring),
    'SSL':           p.monitoring?.ssl_imagen_url ? 'Sí' : 'No',
    'Rendimiento':   p.monitoring?.rendimiento_score ?? '',
    'Estabilidad':   p.monitoring?.estabilidad_diseno ?? '',
    'Formularios':   p.monitoring?.pruebas_formularios ?? '',
    'Backup':        p.monitoring?.backup ?? '',
    'Tareas':        p.monitoring?.tareas_ejecutar ?? '',
    'Notas':         p.monitoring?.notas ?? '',
    'Estado':        p.monitoring ? 'Monitoreado' : 'Pendiente',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Monitoreo')

  ws['!cols'] = [
    { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 12 },
    { wch: 8  }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 14 },
  ]

  XLSX.writeFile(wb, `monitoreo-${fecha}.xlsx`)
}
