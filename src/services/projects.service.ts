// Run this in Supabase SQL Editor to add archived column:
// ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

import { supabase } from '@/lib/supabase/client'
import type { Project, CreateProjectPayload } from '@/lib/types'

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('archived', false)
    .order('nombre')

  if (error) throw error
  return data ?? []
}

export async function getArchivedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('archived', true)
    .order('nombre')

  if (error) throw error
  return data ?? []
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function archiveProject(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase.from('projects').update({ archived }).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// La clave de wp-admin no viaja en las filas de projects: vive cifrada en
// Supabase Vault y solo se lee/escribe con estas funciones de la base
// (migración 38 del Centro de Mando). Exigen sesión y rol editor/admin en
// monitoreo_miembros, y cada uso queda auditado.
export async function revealProjectKey(id: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('revelar_clave_proyecto', { p_project_id: id })
  if (error) throw error
  return data as string | null
}

// null o '' borra la clave guardada.
export async function saveProjectKey(id: string, clave: string | null): Promise<void> {
  const { error } = await supabase.rpc('guardar_clave_proyecto', { p_project_id: id, p_clave: clave })
  if (error) throw error
}

export function isPermissionError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '42501'
}

// Lo que se pidió en KeyField: vacío y sin quitar = no tocar la clave.
export async function applyKeyChange(id: string, clave: string, remove: boolean): Promise<void> {
  if (remove) return saveProjectKey(id, null)
  if (clave) return saveProjectKey(id, clave)
}
