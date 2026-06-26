'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { upsertMonitoring, uploadImage } from '@/services/monitoring.service'
import { useToast } from '@/components/ui/Toast'
import type { ProjectWithMonitoring } from '@/lib/types'

interface MonitoringFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project: ProjectWithMonitoring
  selectedDate: string
}

export function MonitoringFormModal({
  open,
  onClose,
  onSuccess,
  project,
  selectedDate,
}: MonitoringFormModalProps) {
  const m = project.monitoring
  const { toast } = useToast()
  const sslRef = useRef<HTMLInputElement>(null)
  const rendRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    rendimiento_score:   m?.rendimiento_score   ?? '',
    estabilidad_diseno:  m?.estabilidad_diseno  ?? '',
    pruebas_formularios: m?.pruebas_formularios ?? '',
    backup:              m?.backup              ?? '',
    notas:               m?.notas               ?? '',
    tareas_ejecutar:     m?.tareas_ejecutar     ?? '',
  })

  const [sslUrl, setSslUrl]   = useState<string | null>(m?.ssl_imagen_url ?? null)
  const [rendUrl, setRendUrl] = useState<string | null>(m?.rendimiento_imagen_url ?? null)
  const [sslFile, setSslFile]   = useState<File | null>(null)
  const [rendFile, setRendFile] = useState<File | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleImg = (type: 'ssl' | 'rend', file: File) => {
    const url = URL.createObjectURL(file)
    if (type === 'ssl') { setSslFile(file); setSslUrl(url) }
    else { setRendFile(file); setRendUrl(url) }
  }

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let finalSslUrl   = m?.ssl_imagen_url ?? null
      let finalRendUrl  = m?.rendimiento_imagen_url ?? null

      if (sslFile)  finalSslUrl  = await uploadImage(sslFile,  project.id, 'ssl',         selectedDate)
      if (rendFile) finalRendUrl = await uploadImage(rendFile, project.id, 'rendimiento', selectedDate)

      await upsertMonitoring({
        project_id:              project.id,
        fecha:                   selectedDate,
        ssl_imagen_url:          finalSslUrl,
        rendimiento_imagen_url:  finalRendUrl,
        rendimiento_score:       form.rendimiento_score   || null,
        estabilidad_diseno:      form.estabilidad_diseno  || null,
        pruebas_formularios:     form.pruebas_formularios || null,
        backup:                  form.backup              || null,
        notas:                   form.notas               || null,
        tareas_ejecutar:         form.tareas_ejecutar     || null,
      })

      toast('Monitoreo guardado', 'success')
      onSuccess()
      onClose()
    } catch {
      toast('Error al guardar el monitoreo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const ImageUploader = ({
    label,
    url,
    inputRef,
    onFile,
  }: {
    label: string
    url: string | null
    inputRef: React.RefObject<HTMLInputElement | null>
    onFile: (f: File) => void
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{label}</label>
      <div
        className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[#1E293B] hover:border-emerald-500/40 transition-colors cursor-pointer min-h-28 group"
        onClick={() => inputRef.current?.click()}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="max-h-24 rounded-lg object-contain" />
        ) : (
          <>
            <ImageIcon className="w-6 h-6 text-[#334155] group-hover:text-emerald-500/60 transition-colors" />
            <span className="text-xs text-[#475569]">Click para subir imagen</span>
          </>
        )}
        <Upload className="absolute top-2 right-2 w-3.5 h-3.5 text-[#334155] group-hover:text-emerald-400 transition-colors" />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Monitoreo · ${project.nombre}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Imágenes */}
        <div className="grid grid-cols-2 gap-4">
          <ImageUploader
            label="SSL (captura)"
            url={sslUrl}
            inputRef={sslRef}
            onFile={(f) => handleImg('ssl', f)}
          />
          <ImageUploader
            label="Rendimiento (captura)"
            url={rendUrl}
            inputRef={rendRef}
            onFile={(f) => handleImg('rend', f)}
          />
        </div>

        {/* Campos */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Rendimiento"
            placeholder="Ej: 9/10"
            value={form.rendimiento_score}
            onChange={set('rendimiento_score')}
          />
          <Input
            label="Estabilidad / Diseño"
            placeholder="Ej: Todos funcionales"
            value={form.estabilidad_diseno}
            onChange={set('estabilidad_diseno')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pruebas de formularios"
            placeholder="Ej: OK / Falla formulario contacto"
            value={form.pruebas_formularios}
            onChange={set('pruebas_formularios')}
          />
          <Input
            label="Backup"
            placeholder="Ej: Backup sacado desde Infra"
            value={form.backup}
            onChange={set('backup')}
          />
        </div>

        <Textarea
          label="Notas"
          placeholder="Observaciones generales, nuevos desarrollos..."
          value={form.notas}
          onChange={set('notas')}
          rows={3}
        />

        <Textarea
          label="Tareas a ejecutar"
          placeholder="Actualizar Bricks, WordPress..."
          value={form.tareas_ejecutar}
          onChange={set('tareas_ejecutar')}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar monitoreo
          </Button>
        </div>
      </form>
    </Modal>
  )
}
