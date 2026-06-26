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
