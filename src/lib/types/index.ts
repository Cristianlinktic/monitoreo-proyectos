export interface Redirect {
  nombre: string
  url: string
}

export interface Project {
  id: string
  nombre: string
  maquetador: string | null
  url: string | null
  plugins: string[]
  redirects: Redirect[]
  ceco: string | null
  dominio: string | null
  vencimiento_dominio: string | null
  link_acceso_editor: string | null
  usuario: string | null
  // La clave vive cifrada en Supabase Vault: aquí solo la referencia.
  // Se muestra con revealProjectKey() y se guarda con saveProjectKey().
  clave_secret_id: string | null
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

export type MonitoreoRol = 'lector' | 'editor' | 'admin'

export interface MiembroMonitor {
  user_id: string
  email: string | null
  rol: MonitoreoRol
  created_at: string
}

export interface CrearMiembroPayload {
  email: string
  password: string
  rol: MonitoreoRol
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
  redirects?: Redirect[]
  ceco?: string | null
  dominio?: string | null
  vencimiento_dominio?: string | null
  link_acceso_editor?: string | null
  usuario?: string | null
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
