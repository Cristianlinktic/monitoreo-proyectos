'use client'

import { useEffect, useState } from 'react'
import { Plus, X, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react'
import { getTasksByProject, createTask, updateTaskEstado, deleteTask } from '@/services/tasks.service'
import type { Task } from '@/lib/types'

interface TasksPanelProps {
  projectId: string
}

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: '#F59E0B', icon: Circle },
  en_progreso: { label: 'En progreso', color: '#22D3EE', icon: Clock },
  resuelto:    { label: 'Resuelto',    color: '#34D399', icon: CheckCircle2 },
}

const NEXT_ESTADO: Record<Task['estado'], Task['estado']> = {
  pendiente: 'en_progreso',
  en_progreso: 'resuelto',
  resuelto: 'pendiente',
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const [y,m,d] = dateStr.split('-').map(Number)
  return Math.round((new Date(y,m-1,d).getTime() - today.getTime()) / 86400000)
}

function DeadlineBadge({ fecha }: { fecha: string }) {
  const days = daysUntil(fecha)
  const color = days < 0 ? '#F87171' : days <= 3 ? '#F59E0B' : '#7A6E99'
  const label = days < 0 ? `Vencida hace ${Math.abs(days)}d` : days === 0 ? 'Hoy' : `${days}d restantes`
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {label}
    </span>
  )
}

export function TasksPanel({ projectId }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_limite: '' })

  const reload = () => {
    setLoadingTasks(true)
    getTasksByProject(projectId)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoadingTasks(false))
  }

  useEffect(() => { reload() }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEstado = async (task: Task) => {
    const next = NEXT_ESTADO[task.estado]
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, estado: next } : t))
    await updateTaskEstado(task.id, next).catch(() => reload())
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    setTasks(prev => prev.filter(t => t.id !== id))
    await deleteTask(id).catch(() => reload())
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    setSaving(true)
    try {
      await createTask({
        project_id: projectId,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        estado: 'pendiente',
        fecha_limite: form.fecha_limite || null,
      })
      setForm({ titulo: '', descripcion: '', fecha_limite: '' })
      setShowForm(false)
      reload()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const groups: Task['estado'][] = ['pendiente', 'en_progreso', 'resuelto']

  return (
    <div className="flex flex-col gap-4">
      {loadingTasks ? (
        <div className="py-8 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-[#F472C2]/30 border-t-[#F472C2] animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {groups.map(estado => {
            const list = tasks.filter(t => t.estado === estado)
            if (list.length === 0) return null
            const cfg = ESTADO_CONFIG[estado]
            const Icon = cfg.icon
            return (
              <div key={estado}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
                    {cfg.label} · {list.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {list.map(task => (
                    <div key={task.id}
                      className="flex items-start gap-3 p-3 rounded-xl group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}20` }}>
                      <button
                        onClick={() => handleEstado(task)}
                        title={`Cambiar a ${NEXT_ESTADO[task.estado]}`}
                        className="mt-0.5 shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: cfg.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-snug ${task.estado === 'resuelto' ? 'line-through opacity-50' : ''}`}
                          style={{ color: task.estado === 'resuelto' ? undefined : 'var(--text)' }}>
                          {task.titulo}
                        </p>
                        {task.descripcion && (
                          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-faint)' }}>{task.descripcion}</p>
                        )}
                        {task.fecha_limite && (
                          <div className="mt-1.5">
                            <DeadlineBadge fecha={task.fecha_limite} />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mt-0.5 shrink-0"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {tasks.length === 0 && !showForm && (
            <div className="py-8 text-center">
              <AlertTriangle className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Sin tareas para este proyecto</p>
            </div>
          )}
        </>
      )}

      {/* New task form */}
      {showForm ? (
        <form onSubmit={handleCreate}
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,114,194,0.25)' }}>
          <input
            type="text"
            placeholder="Título de la tarea *"
            value={form.titulo}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            required
            autoFocus
            className="w-full px-3 py-2 rounded-lg text-sm placeholder:text-[#7A6E99] focus:outline-none transition-all"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,114,194,0.45)' }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm placeholder:text-[#7A6E99] focus:outline-none transition-all resize-none"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,114,194,0.45)' }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
          />
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Fecha límite</label>
              <input
                type="date"
                value={form.fecha_limite}
                onChange={e => setForm(p => ({ ...p, fecha_limite: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-all w-full"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,114,194,0.45)' }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setForm({ titulo: '', descripcion: '', fecha_limite: '' }) }}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              style={{ border: '1px solid var(--border-soft)', color: 'var(--text-faint)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--accent-gradient)', color: '#FFFFFF', boxShadow: '0 0 12px rgba(244,114,194,0.3)' }}>
              {saving ? 'Guardando…' : 'Guardar tarea'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer w-full"
          style={{ background: 'rgba(244,114,194,0.06)', border: '1px dashed rgba(244,114,194,0.25)', color: 'var(--accent)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,114,194,0.45)'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,194,0.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,114,194,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,194,0.06)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva tarea
        </button>
      )}
    </div>
  )
}
