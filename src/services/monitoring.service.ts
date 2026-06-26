import { supabase } from '@/lib/supabase/client'
import type { MonitoringEntry, ProjectWithMonitoring, UpsertMonitoringPayload } from '@/lib/types'

export async function getMonitoringByDate(fecha: string): Promise<ProjectWithMonitoring[]> {
  const { data: projects, error: pe } = await supabase
    .from('projects')
    .select('*')
    .order('nombre')

  if (pe) throw pe

  const { data: entries, error: me } = await supabase
    .from('monitoring_entries')
    .select('*')
    .eq('fecha', fecha)

  if (me) throw me

  const entryMap = new Map<string, MonitoringEntry>()
  for (const entry of entries ?? []) {
    entryMap.set(entry.project_id, entry)
  }

  return (projects ?? []).map((p) => ({
    ...p,
    monitoring: entryMap.get(p.id) ?? null,
  }))
}

export async function upsertMonitoring(payload: UpsertMonitoringPayload): Promise<MonitoringEntry> {
  const { data, error } = await supabase
    .from('monitoring_entries')
    .upsert(payload, { onConflict: 'project_id,fecha' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadImage(
  file: File,
  projectId: string,
  type: 'ssl' | 'rendimiento',
  fecha: string
): Promise<string> {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'monitoring-images'
  const ext = file.name.split('.').pop()
  const path = `${projectId}/${fecha}/${type}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getAvailableDates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('monitoring_entries')
    .select('fecha')
    .order('fecha', { ascending: false })

  if (error) throw error

  const unique = [...new Set((data ?? []).map((r) => r.fecha))]
  return unique
}

export async function getCoverageStats(): Promise<{ fecha: string; monitored: number }[]> {
  const { data, error } = await supabase
    .from('monitoring_entries')
    .select('fecha')
    .order('fecha', { ascending: true })

  if (error) throw error

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    counts.set(row.fecha, (counts.get(row.fecha) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([fecha, monitored]) => ({ fecha, monitored }))
    .slice(-30)
}
