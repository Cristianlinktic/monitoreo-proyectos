// Run this in Supabase SQL Editor before using tasks:
// CREATE TABLE tasks (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
//   titulo text NOT NULL,
//   descripcion text,
//   estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'resuelto')),
//   fecha_limite date,
//   created_at timestamptz DEFAULT now(),
//   updated_at timestamptz DEFAULT now()
// );

import { supabase } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createTask(payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTaskEstado(id: string, estado: Task['estado']): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
