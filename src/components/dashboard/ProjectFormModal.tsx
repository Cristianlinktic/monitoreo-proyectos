'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { createProject, updateProject } from '@/services/projects.service'
import { useToast } from '@/components/ui/Toast'
import { RedirectsField } from './RedirectsField'
import type { Project, Redirect } from '@/lib/types'

interface ProjectFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project?: Project | null
}

type Tab = 'proyecto' | 'acceso'

const TABS: { id: Tab; label: string }[] = [
  { id: 'proyecto', label: 'Proyecto' },
  { id: 'acceso',   label: 'Acceso' },
]

export function ProjectFormModal({ open, onClose, onSuccess, project }: ProjectFormModalProps) {
  const isEdit = !!project
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('proyecto')

  const [form, setForm] = useState({
    nombre:              project?.nombre              ?? '',
    maquetador:          project?.maquetador          ?? '',
    url:                 project?.url                 ?? '',
    ceco:                project?.ceco                ?? '',
    dominio:             project?.dominio             ?? '',
    vencimiento_dominio: project?.vencimiento_dominio ?? '',
    link_acceso_editor:  project?.link_acceso_editor  ?? '',
    usuario:             project?.usuario             ?? '',
    clave:               project?.clave               ?? '',
    autenticador:        project?.autenticador        ?? '',
    licencias:           project?.licencias           ?? '',
    figma_url:           project?.figma_url           ?? '',
  })

  const [pluginInput, setPluginInput] = useState('')
  const [plugins, setPlugins] = useState<string[]>(project?.plugins ?? [])
  const [redirects, setRedirects] = useState<Redirect[]>(project?.redirects ?? [])
  const [loading, setLoading] = useState(false)

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const addPlugin = () => {
    const t = pluginInput.trim()
    if (t && !plugins.includes(t)) { setPlugins(p => [...p, t]); setPluginInput('') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setLoading(true)
    try {
      const payload = {
        nombre:              form.nombre.trim(),
        maquetador:          form.maquetador          || null,
        url:                 form.url                 || null,
        ceco:                form.ceco                || null,
        dominio:             form.dominio             || null,
        vencimiento_dominio: form.vencimiento_dominio || null,
        link_acceso_editor:  form.link_acceso_editor  || null,
        usuario:             form.usuario             || null,
        clave:               form.clave               || null,
        autenticador:        form.autenticador        || null,
        licencias:           form.licencias           || null,
        figma_url:           form.figma_url           || null,
        plugins,
        redirects,
      }
      if (isEdit && project) {
        await updateProject(project.id, payload)
        toast('Proyecto actualizado', 'success')
      } else {
        await createProject(payload)
        toast('Proyecto creado', 'success')
      }
      onSuccess()
      onClose()
    } catch {
      toast('Error al guardar el proyecto', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar proyecto' : 'Nuevo proyecto'} size="xl">
      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
            style={tab === t.id ? {
              background: 'linear-gradient(135deg, rgba(244,114,194,0.2), rgba(124,58,237,0.14))',
              border: '1px solid rgba(244,114,194,0.3)',
              color: 'var(--text)',
            } : {
              border: '1px solid transparent',
              color: 'var(--text-faint)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* ── Tab: Proyecto ── */}
        {tab === 'proyecto' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Nombre del proyecto *"
                  placeholder="Ej: LinkTIC página en producción"
                  value={form.nombre}
                  onChange={set('nombre')}
                  required
                />
              </div>
              <Input
                label="Maquetador / Hosting"
                placeholder="Bricks / Elementor / Shopify"
                value={form.maquetador}
                onChange={set('maquetador')}
              />
              <Input
                label="URL"
                placeholder="https://proyecto.com"
                value={form.url}
                onChange={set('url')}
              />
              <Input
                label="CECO"
                placeholder="Ej: 204"
                value={form.ceco}
                onChange={set('ceco')}
              />
              <Input
                label="Figma"
                placeholder="https://figma.com/file/..."
                value={form.figma_url}
                onChange={set('figma_url')}
              />
            </div>

            <Textarea
              label="Licencias"
              placeholder="Bricks - Vence dic 2025&#10;WPML - Activa"
              value={form.licencias}
              onChange={set('licencias')}
              rows={3}
            />

            {/* Plugins */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Plugins instalados
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pluginInput}
                  onChange={e => setPluginInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPlugin() } }}
                  placeholder="Nombre del plugin + Enter"
                  className="flex-1 px-3 py-2 rounded-lg text-sm placeholder:text-[color:var(--text-faint)] focus:outline-none transition-colors"
                  style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(244,114,194,0.4)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(244,114,194,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={addPlugin}
                  className="px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {plugins.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg max-h-36 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)' }}>
                  {plugins.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(244,114,194,0.15)', color: 'var(--accent)' }}>
                      {p}
                      <button
                        type="button"
                        onClick={() => setPlugins(prev => prev.filter(x => x !== p))}
                        className="transition-colors cursor-pointer"
                        style={{ color: 'var(--accent)', opacity: 0.7 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Redirects de formularios */}
            <RedirectsField value={redirects} onChange={setRedirects} />
          </>
        )}

        {/* ── Tab: Acceso ── */}
        {tab === 'acceso' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Dominio"
                placeholder="proyecto.com"
                value={form.dominio}
                onChange={set('dominio')}
              />
              <Input
                label="Vencimiento dominio"
                type="date"
                value={form.vencimiento_dominio}
                onChange={set('vencimiento_dominio')}
              />
              <div className="col-span-2">
                <Input
                  label="Link de acceso editor (wp-admin)"
                  placeholder="https://proyecto.com/wp-admin"
                  value={form.link_acceso_editor}
                  onChange={set('link_acceso_editor')}
                />
              </div>
              <Input
                label="Usuario"
                placeholder="admin@proyecto.com"
                value={form.usuario}
                onChange={set('usuario')}
              />
              <Input
                label="Clave"
                type="password"
                placeholder="••••••••"
                value={form.clave}
                onChange={set('clave')}
              />
              <div className="col-span-2">
                <Input
                  label="Autenticador"
                  placeholder="Google Authenticator / Sin autenticador"
                  value={form.autenticador}
                  onChange={set('autenticador')}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
