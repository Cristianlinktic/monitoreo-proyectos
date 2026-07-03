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
      <div className="flex gap-1 mb-5 p-1 bg-[#0A0F1E] rounded-xl border border-[#1E293B]">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
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
              <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                Plugins instalados
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pluginInput}
                  onChange={e => setPluginInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPlugin() } }}
                  placeholder="Nombre del plugin + Enter"
                  className="flex-1 px-3 py-2 rounded-lg text-sm bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={addPlugin}
                  className="px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {plugins.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-[#0A0F1E] rounded-lg border border-[#1E293B] max-h-36 overflow-y-auto">
                  {plugins.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                      {p}
                      <button
                        type="button"
                        onClick={() => setPlugins(prev => prev.filter(x => x !== p))}
                        className="text-[#475569] hover:text-red-400 transition-colors cursor-pointer"
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

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
