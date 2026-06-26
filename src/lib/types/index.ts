export interface Project {
  id: string
  nombre: string
  maquetador: string | null
  url: string | null
  plugins: string[]
  ceco: string | null
  dominio: string | null
  vencimiento_dominio: string | null
  link_acceso_editor: string | null
  usuario: string | null
  clave: string | null
  autenticador: string | null
  licencias: string | null
  figma_url: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  titulo: string
  descripcion: string | null
  estado: 'pendiente' | 'en_progreso' | 'resuelto'
  fecha_limite: string | null
  created_at: string
  updated_at: string
}

export interface MonitoringEntry {
  id: string
  project_id: string
  fecha: string
  ssl_imagen_url: string | null
  rendimiento_imagen_url: string | null
  rendimiento_score: string | null
  estabilidad_diseno: string | null
  pruebas_formularios: string | null
  backup: string | null
  notas: string | null
  tareas_ejecutar: string | null
  created_at: string
  updated_at: string
}

export interface ProjectWithMonitoring extends Project {
  monitoring?: MonitoringEntry | null
}

export type StatusLevel = 'ok' | 'warning' | 'critical' | 'pending'

export interface UpsertMonitoringPayload {
  project_id: string
  fecha: string
  ssl_imagen_url?: string | null
  rendimiento_imagen_url?: string | null
  rendimiento_score?: string | null
  estabilidad_diseno?: string | null
  pruebas_formularios?: string | null
  backup?: string | null
  notas?: string | null
  tareas_ejecutar?: string | null
}

export interface CreateProjectPayload {
  nombre: string
  maquetador?: string | null
  url?: string | null
  plugins?: string[]
  ceco?: string | null
  dominio?: string | null
  vencimiento_dominio?: string | null
  link_acceso_editor?: string | null
  usuario?: string | null
  clave?: string | null
  autenticador?: string | null
  licencias?: string | null
  figma_url?: string | null
  archived?: boolean
}

export interface ImportRow {
  nombre: string
  maquetador?: string
  url?: string
  plugins?: string
  ceco?: string
  dominio?: string
  vencimiento_dominio?: string
  link_acceso_editor?: string
  usuario?: string
  clave?: string
  autenticador?: string
  licencias?: string
  figma_url?: string
  ssl?: string
  rendimiento?: string
  estabilidad_diseno?: string
  pruebas_formularios?: string
  backup?: string
  notas?: string
  tareas_ejecutar?: string
  fecha_monitoreo?: string
}
