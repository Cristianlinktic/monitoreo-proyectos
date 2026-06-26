'use client'

import { useState, useRef } from 'react'
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { updateProject } from '@/services/projects.service'
import { upsertMonitoring, uploadImage } from '@/services/monitoring.service'
import { useToast } from '@/components/ui/Toast'
import type { ProjectWithMonitoring } from '@/lib/types'

type Tab = 'monitoreo' | 'proyecto' | 'acceso'

const TABS: { id: Tab; label: string }[] = [
  { id: 'monitoreo', label: 'Monitoreo' },
  { id: 'proyecto',  label: 'Proyecto'  },
  { id: 'acceso',    label: 'Acceso'    },
]

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project: ProjectWithMonitoring
  selectedDate: string
}

export function ProjectEditModal({ open, onClose, onSuccess, project, selectedDate }: Props) {
  const { toast } = useToast()
  const m = project.monitoring
  const [tab, setTab] = useState<Tab>('monitoreo')
  const [loading, setLoading] = useState(false)

  // ── Monitoreo ─────────────────────────────────────────────────────────────
  const sslRef  = useRef<HTMLInputElement>(null)
  const rendRef = useRef<HTMLInputElement>(null)

  const [mon, setMon] = useState({
    rendimiento_score:   m?.rendimiento_score   ?? '',
    estabilidad_diseno:  m?.estabilidad_diseno  ?? '',
    pruebas_formularios: m?.pruebas_formularios ?? '',
    backup:              m?.backup              ?? '',
    notas:               m?.notas               ?? '',
    tareas_ejecutar:     m?.tareas_ejecutar     ?? '',
  })
  const [sslUrl,  setSslUrl]  = useState<string | null>(m?.ssl_imagen_url ?? null)
  const [rendUrl, setRendUrl] = useState<string | null>(m?.rendimiento_imagen_url ?? null)
  const [sslFile,  setSslFile]  = useState<File | null>(null)
  const [rendFile, setRendFile] = useState<File | null>(null)

  const setMonField = (f: keyof typeof mon) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMon(p => ({ ...p, [f]: e.target.value }))

  const handleImg = (type: 'ssl' | 'rend', file: File) => {
    const url = URL.createObjectURL(file)
    if (type === 'ssl') { setSslFile(file); setSslUrl(url) }
    else { setRendFile(file); setRendUrl(url) }
  }

  // ── Proyecto ──────────────────────────────────────────────────────────────
  const [proj, setProj] = useState({
    nombre:    project.nombre     ?? '',
    maquetador: project.maquetador ?? '',
    url:        project.url        ?? '',
    ceco:       project.ceco       ?? '',
    figma_url:  project.figma_url  ?? '',
    licencias:  project.licencias  ?? '',
  })
  const [plugins, setPlugins] = useState<string[]>(project.plugins ?? [])
  const [pluginInput, setPluginInput] = useState('')

  const setProjField = (f: keyof typeof proj) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProj(p => ({ ...p, [f]: e.target.value }))

  const addPlugin = () => {
    const t = pluginInput.trim()
    if (t && !plugins.includes(t)) { setPlugins(p => [...p, t]); setPluginInput('') }
  }

  // ── Acceso ────────────────────────────────────────────────────────────────
  const [acc, setAcc] = useState({
    dominio:             project.dominio             ?? '',
    vencimiento_dominio: project.vencimiento_dominio ?? '',
    link_acceso_editor:  project.link_acceso_editor  ?? '',
    usuario:             project.usuario             ?? '',
    clave:               project.clave               ?? '',
    autenticador:        project.autenticador        ?? '',
  })

  const setAccField = (f: keyof typeof acc) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAcc(p => ({ ...p, [f]: e.target.value }))

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proj.nombre.trim()) return
    setLoading(true)
    try {
      await updateProject(project.id, {
        nombre:              proj.nombre.trim(),
        maquetador:          proj.maquetador          || null,
        url:                 proj.url                 || null,
        ceco:                proj.ceco                || null,
        figma_url:           proj.figma_url           || null,
        licencias:           proj.licencias           || null,
        plugins,
        dominio:             acc.dominio              || null,
        vencimiento_dominio: acc.vencimiento_dominio  || null,
        link_acceso_editor:  acc.link_acceso_editor   || null,
        usuario:             acc.usuario              || null,
        clave:               acc.clave                || null,
        autenticador:        acc.autenticador         || null,
      })

      const hasMonData = Object.values(mon).some(v => v) || sslFile || rendFile
      if (hasMonData) {
        let finalSslUrl  = m?.ssl_imagen_url  ?? null
        let finalRendUrl = m?.rendimiento_imagen_url ?? null
        if (sslFile)  finalSslUrl  = await uploadImage(sslFile,  project.id, 'ssl',          selectedDate)
        if (rendFile) finalRendUrl = await uploadImage(rendFile, project.id, 'rendimiento',  selectedDate)

        await upsertMonitoring({
          project_id:             project.id,
          fecha:                  selectedDate,
          ssl_imagen_url:         finalSslUrl,
          rendimiento_imagen_url: finalRendUrl,
          rendimiento_score:      mon.rendimiento_score   || null,
          estabilidad_diseno:     mon.estabilidad_diseno  || null,
          pruebas_formularios:    mon.pruebas_formularios || null,
          backup:                 mon.backup              || null,
          notas:                  mon.notas               || null,
          tareas_ejecutar:        mon.tareas_ejecutar     || null,
        })
      }

      toast('Guardado correctamente', 'success')
      onSuccess()
      onClose()
    } catch {
      toast('Error al guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={project.nombre} size="xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={tab === t.id ? {
              background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.06))',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#22C55E',
              boxShadow: '0 0 12px rgba(34,197,94,0.1)',
            } : {
              border: '1px solid transparent',
              color: '#475569',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* ── Tab: Monitoreo ── */}
        {tab === 'monitoreo' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader label="SSL (captura)"         url={sslUrl}  inputRef={sslRef}  onFile={f => handleImg('ssl', f)} />
              <ImageUploader label="Rendimiento (captura)" url={rendUrl} inputRef={rendRef} onFile={f => handleImg('rend', f)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Rendimiento"        placeholder="Ej: 9/10"           value={mon.rendimiento_score}   onChange={setMonField('rendimiento_score')} />
              <Input label="Estabilidad / Diseño" placeholder="Ej: Estable"      value={mon.estabilidad_diseno}  onChange={setMonField('estabilidad_diseno')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Pruebas de formularios" placeholder="OK / Falla..."  value={mon.pruebas_formularios} onChange={setMonField('pruebas_formularios')} />
              <Input label="Backup"                 placeholder="Backup desde Infra" value={mon.backup}          onChange={setMonField('backup')} />
            </div>
            <Textarea label="Notas"             placeholder="Observaciones..." value={mon.notas}           onChange={setMonField('notas')}           rows={3} />
            <Textarea label="Tareas a ejecutar" placeholder="Actualizar Bricks, WP..." value={mon.tareas_ejecutar} onChange={setMonField('tareas_ejecutar')} rows={3} />
          </>
        )}

        {/* ── Tab: Proyecto ── */}
        {tab === 'proyecto' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Nombre *" placeholder="Nombre del proyecto" value={proj.nombre} onChange={setProjField('nombre')} required />
              </div>
              <Input label="Maquetador / Hosting" placeholder="Bricks / Elementor" value={proj.maquetador} onChange={setProjField('maquetador')} />
              <Input label="URL"   placeholder="https://proyecto.com"     value={proj.url}       onChange={setProjField('url')} />
              <Input label="CECO"  placeholder="Ej: 204"                  value={proj.ceco}      onChange={setProjField('ceco')} />
              <Input label="Figma" placeholder="https://figma.com/..."    value={proj.figma_url} onChange={setProjField('figma_url')} />
            </div>
            <Textarea label="Licencias" placeholder="Bricks - Vence dic 2025" value={proj.licencias} onChange={setProjField('licencias')} rows={3} />
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Plugins instalados</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pluginInput}
                  onChange={e => setPluginInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPlugin() } }}
                  placeholder="Nombre del plugin + Enter"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
              style={{ background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.7)' }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(34,197,94,0.08)' }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.7)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                />
                <button type="button" onClick={addPlugin} className="px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {plugins.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-[#0A0F1E] rounded-lg border border-[#1E293B] max-h-36 overflow-y-auto">
                  {plugins.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                      {p}
                      <button type="button" onClick={() => setPlugins(prev => prev.filter(x => x !== p))} className="text-[#475569] hover:text-red-400 transition-colors cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tab: Acceso ── */}
        {tab === 'acceso' && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dominio"             placeholder="proyecto.com"              value={acc.dominio}             onChange={setAccField('dominio')} />
            <Input label="Vencimiento dominio" type="date"                             value={acc.vencimiento_dominio} onChange={setAccField('vencimiento_dominio')} />
            <div className="col-span-2">
              <Input label="Link editor (wp-admin)" placeholder="https://proyecto.com/wp-admin" value={acc.link_acceso_editor} onChange={setAccField('link_acceso_editor')} />
            </div>
            <Input label="Usuario"             placeholder="admin@proyecto.com"        value={acc.usuario}      onChange={setAccField('usuario')} />
            <Input label="Clave"               type="password" placeholder="••••••••" value={acc.clave}         onChange={setAccField('clave')} />
            <div className="col-span-2">
              <Input label="Autenticador"      placeholder="Google Authenticator / Sin autenticador" value={acc.autenticador} onChange={setAccField('autenticador')} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  )
}

function ImageUploader({ label, url, inputRef, onFile }: {
  label: string
  url: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onFile: (f: File) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</label>
      <div
        className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[#1E293B] hover:border-emerald-500/40 transition-colors cursor-pointer min-h-28 group"
        onClick={() => inputRef.current?.click()}
      >
        {url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={url} alt={label} className="max-h-24 rounded-lg object-contain" />
          : <>
              <ImageIcon className="w-6 h-6 text-[#334155] group-hover:text-emerald-500/60 transition-colors" />
              <span className="text-xs text-[#475569]">Click para subir imagen</span>
            </>
        }
        <Upload className="absolute top-2 right-2 w-3.5 h-3.5 text-[#334155] group-hover:text-emerald-400 transition-colors" />
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>
    </div>
  )
}
