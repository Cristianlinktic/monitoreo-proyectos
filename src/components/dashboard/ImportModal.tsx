'use client'

import { useState, useRef } from 'react'
import {
  Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2,
  AlertTriangle, Database, Calendar,
} from 'lucide-react'
import { read, utils } from 'xlsx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import type { ImportRow } from '@/lib/types'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface LegacyRow extends ImportRow {
  _status?: 'pending' | 'ok' | 'error'
  _error?: string
}

interface ProjectRow {
  [key: string]: string
  nombre: string
  ceco: string
  ambiente: string
  estado_proyecto: string
  tipo_sitio: string
  tipo_proyecto: string
  propiedad: string
  tipo_facturacion: string
  url: string
  dominio: string
  vencimiento_dominio: string
  link_acceso_editor: string
  usuario: string
  clave: string
  autenticador: string
  maquetador: string
  licencias: string
  figma_url: string
  webhooks: string
  plugins: string
}

interface HistorialRow {
  [key: string]: string
  fecha: string
  nombre: string
  maquetador: string
  plugins: string
  rendimiento: string
  estabilidad: string
  formularios: string
  backup: string
  notas: string
  tareas: string
}

// ── Column maps ────────────────────────────────────────────────────────────────

const COL_MAP_LEGACY: Record<string, keyof ImportRow> = {
  'NOMBRE PROYECTO':      'nombre',
  'CECO':                 'ceco',
  'URL BASICA':           'url',
  'DOMINIO':              'dominio',
  'VENCIMIENTO DOMINIO':  'vencimiento_dominio',
  'LINK DE ACCESO EDITOR':'link_acceso_editor',
  'USUARIO':              'usuario',
  'CLAVE':                'clave',
  'AUTENTICADOR':         'autenticador',
  'MAQUETADOR / HOSTING': 'maquetador',
  'LICENCIAS':            'licencias',
  'FIGMA':                'figma_url',
  'PLUGINS':              'plugins',
  'PLUGINS (ULTIMOS)':    'plugins',
  'SSL':                  'ssl',
  'RENDIMIENTO':          'rendimiento',
  'ESTABILIDAD / DISENO': 'estabilidad_diseno',
  'PRUEBAS FORMULARIOS':  'pruebas_formularios',
  'BACKUP':               'backup',
  'NOTAS':                'notas',
  'TAREAS A EJECUTAR':    'tareas_ejecutar',
  'TAREAS A EJECUTAAR':   'tareas_ejecutar',
  'ULTIMA FECHA MONITOREO':'fecha_monitoreo',
}

const COL_MAP_PROJECTS: Record<string, keyof ProjectRow> = {
  'NOMBRE PROYECTO':      'nombre',
  'CECO':                 'ceco',
  'URL BASICA':           'url',
  'DOMINIO':              'dominio',
  'VENCIMIENTO DOMINIO':  'vencimiento_dominio',
  'LINK DE ACCESO EDITOR':'link_acceso_editor',
  'USUARIO':              'usuario',
  'CLAVE':                'clave',
  'AUTENTICADOR':         'autenticador',
  'MAQUETADOR / HOSTING': 'maquetador',
  'LICENCIAS':            'licencias',
  'FIGMA':                'figma_url',
  'PLUGINS (ULTIMOS)':    'plugins',
  'PLUGINS':              'plugins',
}

const COL_MAP_HISTORIAL: Record<string, keyof HistorialRow> = {
  'FECHA':                'fecha',
  'NOMBRE PROYECTO':      'nombre',
  'MAQUETADOR':           'maquetador',
  'PLUGINS':              'plugins',
  'RENDIMIENTO':          'rendimiento',
  'ESTABILIDAD / DISENO': 'estabilidad',
  'PRUEBAS FORMULARIOS':  'formularios',
  'BACKUP':               'backup',
  'NOTAS':                'notas',
  'TAREAS A EJECUTAR':    'tareas',
  'TAREAS A EJECUTAAR':   'tareas',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function cv(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v).trim()
  return s === 'None' || s === 'nan' ? '' : s
}

function norm(s: string): string {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function parsePlugins(raw: string): string[] {
  if (!raw) return []
  return raw.split(/\n|,/).map(s => s.trim()).filter(Boolean)
}

function normalizeEstabilidad(raw: string | null | undefined): string | null {
  if (!raw) return null
  const v = raw.trim()
  // Fechas y números de serie de Excel no tienen significado como estado → vacío
  if (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{5}(\.\d+)?$/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(v)) return null
  const low = v.toLowerCase()
  if (low === 'n/a' || low === 'c') return null
  return v
}

function parseDate(raw: string): string | null {
  if (!raw) return null
  const dm = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dm) return `${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0,10)
  const n = Number(raw)
  if (!isNaN(n) && n > 1000) {
    const d = new Date((n - 25569) * 86400 * 1000)
    return d.toISOString().slice(0,10)
  }
  return null
}

function parseSheet<T extends Record<string, string>>(
  raw: unknown[][],
  colMap: Record<string, keyof T>,
  nameKey: string
): T[] {
  // Find header row
  let headerIdx = -1
  let headers: string[] = []
  for (let i = 0; i < Math.min(5, raw.length); i++) {
    const row = raw[i] as unknown[]
    const normRow = row.map(c => norm(cv(c)))
    const hasName = normRow.some(c => c === norm(nameKey))
    if (hasName) {
      headerIdx = i
      headers = normRow
      break
    }
  }
  if (headerIdx === -1) return []

  const rows: T[] = []
  for (let i = headerIdx + 1; i < raw.length; i++) {
    const row = raw[i] as unknown[]
    const first = cv(row[0])
    if (!first) continue
    const obj: Record<string, string> = {}
    headers.forEach((h, ci) => {
      const field = colMap[h]
      if (field) obj[field as string] = cv(row[ci])
    })
    if (obj[nameKey.toLowerCase().replace(/\s/g,'_')] || obj['nombre']) {
      rows.push(obj as T)
    }
  }
  return rows.filter(r => r.nombre)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'legacy' | 'complete' | 'monitoring'>('legacy')
  const [legacyRows, setLegacyRows] = useState<LegacyRow[]>([])
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([])
  const [historialRows, setHistorialRows] = useState<HistorialRow[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
  const [progress, setProgress] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const [results, setResults] = useState({ projects: 0, monitoring: 0, errors: 0 })

  // ── Parse file ──────────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = read(e.target?.result, { type: 'binary' })
        const hasHistorial = wb.SheetNames.some(n =>
          norm(n).includes('HISTORIAL') || norm(n) === 'HISTORIAL MONITOREO'
        )
        const hasProyectos = wb.SheetNames.some(n =>
          norm(n) === 'PROYECTOS'
        )

        if (hasHistorial && hasProyectos) {
          // ── Complete format (PROYECTOS + HISTORIAL MONITOREO) ──
          const wsP = wb.Sheets['PROYECTOS']
          const wsH = wb.Sheets['HISTORIAL MONITOREO']
          if (!wsP || !wsH) {
            toast('No se encontraron las hojas PROYECTOS o HISTORIAL MONITOREO', 'error')
            return
          }
          const rawP = utils.sheet_to_json<unknown[]>(wsP, { header: 1 }) as unknown[][]
          const rawH = utils.sheet_to_json<unknown[]>(wsH, { header: 1 }) as unknown[][]

          const pRows = parseSheet<ProjectRow>(rawP, COL_MAP_PROJECTS, 'NOMBRE PROYECTO')
          const hRows = parseSheet<HistorialRow>(rawH, COL_MAP_HISTORIAL, 'NOMBRE PROYECTO')

          if (pRows.length === 0) {
            toast('No se encontraron proyectos en la hoja PROYECTOS', 'error')
            return
          }
          setProjectRows(pRows)
          setHistorialRows(hRows)
          setMode('complete')
          setStep('preview')
        } else if (hasHistorial) {
          // ── Monitoring-only format (solo HISTORIAL MONITOREO) ──
          const wsH = wb.Sheets[wb.SheetNames.find(n => norm(n).includes('HISTORIAL')) ?? '']
          if (!wsH) {
            toast('No se encontró la hoja HISTORIAL MONITOREO', 'error')
            return
          }
          const rawH = utils.sheet_to_json<unknown[]>(wsH, { header: 1 }) as unknown[][]
          const hRows = parseSheet<HistorialRow>(rawH, COL_MAP_HISTORIAL, 'NOMBRE PROYECTO')
          if (hRows.length === 0) {
            toast('No se encontraron registros en la hoja HISTORIAL MONITOREO', 'error')
            return
          }
          setHistorialRows(hRows)
          setMode('monitoring')
          setStep('preview')
        } else {
          // ── Legacy format ──
          const sheetName = wb.SheetNames.find(n =>
            norm(n).includes('UNIFICAD') ||
            norm(n).includes('PROYECTO') ||
            norm(n) === 'PROYECTOS UNIFICADOS'
          ) ?? wb.SheetNames[0]

          const ws = wb.Sheets[sheetName]
          const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][]

          let headerRow = -1
          let headers: string[] = []
          for (let i = 0; i < Math.min(5, raw.length); i++) {
            const row = raw[i] as unknown[]
            const found = (row as unknown[]).findIndex(c => norm(cv(c)) === 'NOMBRE PROYECTO')
            if (found >= 0) {
              headerRow = i
              headers = (row as unknown[]).map(c => norm(cv(c)))
              break
            }
          }
          if (headerRow === -1) {
            toast('No se encontró columna "NOMBRE PROYECTO" en el archivo', 'error')
            return
          }

          const rows: LegacyRow[] = []
          for (let i = headerRow + 1; i < raw.length; i++) {
            const row = raw[i] as unknown[]
            if (!row[0]) continue
            const obj: Record<string, string> = { nombre: '' }
            headers.forEach((h, ci) => {
              const field = COL_MAP_LEGACY[h]
              if (field) obj[field as string] = cv((row as unknown[])[ci])
            })
            const importRow = obj as unknown as ImportRow
            if (!importRow.nombre) continue
            rows.push({ ...importRow, _status: 'pending' })
          }

          setLegacyRows(rows)
          setMode('legacy')
          setStep('preview')
        }
      } catch (err) {
        toast('Error al leer el archivo Excel', 'error')
        console.error(err)
      }
    }
    reader.readAsBinaryString(file)
  }

  // ── Import legacy ───────────────────────────────────────────────────────────

  const handleImportLegacy = async () => {
    setStep('importing')
    let ok = 0, errors = 0
    const today = todayISO()

    for (let i = 0; i < legacyRows.length; i++) {
      const row = legacyRows[i]
      setProgress(Math.round(((i + 1) / legacyRows.length) * 100))
      setImportStatus(`Importando ${i + 1} / ${legacyRows.length}...`)

      try {
        const { data: proj, error: pe } = await supabase
          .from('projects')
          .upsert({
            nombre:              row.nombre,
            ceco:                row.ceco              || null,
            url:                 row.url               || null,
            dominio:             row.dominio           || null,
            vencimiento_dominio: parseDate(row.vencimiento_dominio ?? ''),
            link_acceso_editor:  row.link_acceso_editor || null,
            usuario:             row.usuario           || null,
            clave:               row.clave             || null,
            autenticador:        row.autenticador      || null,
            maquetador:          row.maquetador        || null,
            plugins:             parsePlugins(row.plugins ?? ''),
            licencias:           row.licencias         || null,
            figma_url:           row.figma_url         || null,
          }, { onConflict: 'nombre' })
          .select('id')
          .single()

        if (pe || !proj) throw pe ?? new Error('Sin datos')

        const hasMonitoring = [
          row.ssl, row.rendimiento, row.estabilidad_diseno,
          row.pruebas_formularios, row.backup, row.notas, row.tareas_ejecutar
        ].some(v => v && v.trim())

        if (hasMonitoring) {
          const fecha = parseDate(row.fecha_monitoreo ?? '') ?? today
          await supabase.from('monitoring_entries').upsert({
            project_id:          proj.id,
            fecha,
            rendimiento_score:   row.rendimiento        || null,
            estabilidad_diseno:  normalizeEstabilidad(row.estabilidad_diseno),
            pruebas_formularios: row.pruebas_formularios || null,
            backup:              row.backup             || null,
            notas:               row.notas              || null,
            tareas_ejecutar:     row.tareas_ejecutar    || null,
          }, { onConflict: 'project_id,fecha' })
        }

        ok++
        setLegacyRows(p => p.map((r, idx) => idx === i ? { ...r, _status: 'ok' } : r))
      } catch (err) {
        errors++
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setLegacyRows(p => p.map((r, idx) => idx === i ? { ...r, _status: 'error', _error: msg } : r))
      }
    }

    setResults({ projects: ok, monitoring: 0, errors })
    setStep('done')
    if (ok > 0) onSuccess()
  }

  // ── Import complete (batch) ─────────────────────────────────────────────────

  const pgErrMsg = (err: unknown): string => {
    if (!err) return 'Error desconocido'
    if (typeof err === 'object') {
      const e = err as Record<string, unknown>
      return String(e.message ?? e.details ?? e.hint ?? e.code ?? JSON.stringify(err))
    }
    return String(err)
  }

  const handleImportComplete = async () => {
    setStep('importing')
    let projOk = 0, monOk = 0, errors = 0

    // Step 1: batch upsert projects — one per row to isolate errors
    setImportStatus(`Creando / actualizando ${projectRows.length} proyectos...`)
    setProgress(5)

    for (let i = 0; i < projectRows.length; i++) {
      const r = projectRows[i]
      const { error } = await supabase
        .from('projects')
        .upsert({
          nombre:              r.nombre,
          ceco:                r.ceco              || null,
          url:                 r.url               || null,
          dominio:             r.dominio           || null,
          vencimiento_dominio: parseDate(r.vencimiento_dominio) || null,
          link_acceso_editor:  r.link_acceso_editor || null,
          usuario:             r.usuario           || null,
          clave:               r.clave             || null,
          autenticador:        r.autenticador      || null,
          maquetador:          r.maquetador        || null,
          plugins:             parsePlugins(r.plugins),
          licencias:           r.licencias         || null,
          figma_url:           r.figma_url         || null,
        }, { onConflict: 'nombre' })

      if (error) {
        errors++
        console.warn(`Error en proyecto "${r.nombre}":`, pgErrMsg(error))
      } else {
        projOk++
      }
      setProgress(5 + Math.round(((i + 1) / projectRows.length) * 15))
    }

    if (projOk === 0) {
      toast('No se pudo crear ningún proyecto. Revisa la consola para detalles.', 'error')
      setResults({ projects: 0, monitoring: 0, errors })
      setStep('done')
      return
    }

    // Step 2: load all projects to build name→id map
    setImportStatus('Cargando mapa de proyectos...')
    setProgress(22)

    const { data: allProjects, error: fetchErr } = await supabase
      .from('projects')
      .select('id, nombre')

    if (fetchErr) {
      toast('Error cargando proyectos: ' + pgErrMsg(fetchErr), 'error')
      setResults({ projects: projOk, monitoring: 0, errors })
      setStep('done')
      return
    }

    const nameToId = new Map<string, string>(
      (allProjects ?? []).map(p => [p.nombre as string, p.id as string])
    )
    setProgress(25)

    // Step 3: build monitoring payloads (only rows with matching project)
    const monPayloads = historialRows
      .map(row => {
        const projectId = nameToId.get(row.nombre)
        if (!projectId || !row.fecha) return null
        const hasData = [row.rendimiento, row.estabilidad, row.formularios, row.backup, row.notas, row.tareas].some(v => v)
        if (!hasData) return null
        return {
          project_id:          projectId,
          fecha:               row.fecha,
          rendimiento_score:   row.rendimiento  || null,
          estabilidad_diseno:  normalizeEstabilidad(row.estabilidad),
          pruebas_formularios: row.formularios  || null,
          backup:              row.backup       || null,
          notas:               row.notas        || null,
          tareas_ejecutar:     row.tareas       || null,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    // Step 4: batch upsert monitoring in chunks of 50
    const CHUNK = 50
    for (let i = 0; i < monPayloads.length; i += CHUNK) {
      const chunk = monPayloads.slice(i, i + CHUNK)
      setImportStatus(
        `Guardando historial: ${Math.min(i + CHUNK, monPayloads.length)} / ${monPayloads.length} registros...`
      )

      const { error: monErr } = await supabase
        .from('monitoring_entries')
        .upsert(chunk, { onConflict: 'project_id,fecha' })

      if (monErr) {
        errors++
        console.warn(`Error en chunk ${i}–${i + chunk.length}:`, pgErrMsg(monErr))
      } else {
        monOk += chunk.length
      }

      setProgress(25 + Math.round(((i + chunk.length) / monPayloads.length) * 75))
    }

    setResults({ projects: projOk, monitoring: monOk, errors })
    setStep('done')
    if (projOk > 0 || monOk > 0) onSuccess()
  }

  // ── Import monitoring-only ──────────────────────────────────────────────────

  const handleImportMonitoring = async () => {
    setStep('importing')
    let projOk = 0, monOk = 0, errors = 0

    // Step 1: upsert all unique project names (creates missing ones with just nombre)
    const uniqueNames = [...new Set(historialRows.map(r => r.nombre).filter(Boolean))]
    setImportStatus(`Creando / verificando ${uniqueNames.length} proyectos...`)
    setProgress(5)

    for (let i = 0; i < uniqueNames.length; i++) {
      const nombre = uniqueNames[i]
      const reversed = [...historialRows].reverse().filter(r => r.nombre === nombre)
      const maquetador = reversed.find(r => r.maquetador)?.maquetador || null
      const rawPlugins = reversed.find(r => r.plugins)?.plugins || ''
      const plugins = parsePlugins(rawPlugins)
      const { error } = await supabase
        .from('projects')
        .upsert({ nombre, maquetador, plugins }, { onConflict: 'nombre' })
      if (error) {
        errors++
        console.warn(`Error creando "${nombre}":`, pgErrMsg(error))
      } else {
        projOk++
      }
      setProgress(5 + Math.round(((i + 1) / uniqueNames.length) * 15))
    }

    if (projOk === 0) {
      toast('No se pudieron crear los proyectos. Revisa la consola.', 'error')
      setResults({ projects: 0, monitoring: 0, errors })
      setStep('done')
      return
    }

    // Step 2: fetch all projects to build name→id map
    setImportStatus('Cargando IDs de proyectos...')
    setProgress(22)

    const { data: allProjects, error: fetchErr } = await supabase
      .from('projects')
      .select('id, nombre')

    if (fetchErr) {
      toast('Error cargando proyectos: ' + pgErrMsg(fetchErr), 'error')
      setResults({ projects: projOk, monitoring: 0, errors })
      setStep('done')
      return
    }

    const nameToId = new Map<string, string>(
      (allProjects ?? []).map(p => [p.nombre as string, p.id as string])
    )
    setProgress(25)

    // Step 3: build monitoring payloads
    const monPayloads = historialRows
      .map(row => {
        const projectId = nameToId.get(row.nombre)
        if (!projectId || !row.fecha) return null
        const hasData = [row.rendimiento, row.estabilidad, row.formularios, row.backup, row.notas, row.tareas].some(v => v)
        if (!hasData) return null
        return {
          project_id:          projectId,
          fecha:               row.fecha,
          rendimiento_score:   row.rendimiento  || null,
          estabilidad_diseno:  normalizeEstabilidad(row.estabilidad),
          pruebas_formularios: row.formularios  || null,
          backup:              row.backup       || null,
          notas:               row.notas        || null,
          tareas_ejecutar:     row.tareas       || null,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    // Step 4: batch upsert monitoring in chunks of 50
    const CHUNK = 50
    for (let i = 0; i < monPayloads.length; i += CHUNK) {
      const chunk = monPayloads.slice(i, i + CHUNK)
      setImportStatus(
        `Guardando historial: ${Math.min(i + CHUNK, monPayloads.length)} / ${monPayloads.length} registros...`
      )
      const { error: monErr } = await supabase
        .from('monitoring_entries')
        .upsert(chunk, { onConflict: 'project_id,fecha' })

      if (monErr) {
        errors++
        console.warn(`Error chunk ${i}–${i + chunk.length}:`, pgErrMsg(monErr))
      } else {
        monOk += chunk.length
      }
      setProgress(25 + Math.round(((i + chunk.length) / monPayloads.length) * 75))
    }

    setResults({ projects: projOk, monitoring: monOk, errors })
    setStep('done')
    if (monOk > 0) onSuccess()
  }

  const reset = () => {
    setLegacyRows([])
    setProjectRows([])
    setHistorialRows([])
    setStep('upload')
    setProgress(0)
    setImportStatus('')
    setResults({ projects: 0, monitoring: 0, errors: 0 })
    if (fileRef.current) fileRef.current.value = ''
  }

  // Dates summary for historial
  const datesSummary = (() => {
    if (historialRows.length === 0) return null
    const dates = historialRows.map(r => r.fecha).filter(Boolean).sort()
    if (dates.length === 0) return null
    return `${dates[0]} → ${dates[dates.length - 1]}`
  })()

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Importar desde Excel" size="xl">

      {/* ── Upload ── */}
      {step === 'upload' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="font-heading font-semibold text-[#F8FAFC]">Sube el archivo Excel</p>
            <div className="mt-2 flex flex-col gap-1 text-xs text-[#64748B]">
              <span><code className="text-emerald-400">IMPORTACION_COMPLETA.xlsx</code> — historial completo (recomendado)</span>
              <span><code className="text-[#475569]">IMPORTACION_UNIFICADA.xlsx</code> — formato anterior (compatible)</span>
            </div>
          </div>
          <div
            className="w-full flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-[#1E293B] hover:border-emerald-500/40 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            <Upload className="w-6 h-6 text-[#475569]" />
            <span className="text-sm text-[#475569]">Click o arrastra el archivo aquí</span>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
        </div>
      )}

      {/* ── Preview: solo monitoreo ── */}
      {step === 'preview' && mode === 'monitoring' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0A0F1E] border border-[#1E293B]">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-[#F8FAFC]">
                {historialRows.length} registros de monitoreo
              </p>
              <p className="text-xs text-[#64748B]">
                {new Set(historialRows.map(r => r.nombre)).size} proyectos ·{' '}
                {datesSummary ?? 'sin rango de fechas'}
              </p>
            </div>
          </div>

          {/* Sample preview table */}
          <div>
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
              Muestra de registros
            </p>
            <div className="rounded-xl border border-[#1E293B] overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A0F1E] border-b border-[#1E293B]">
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">Proyecto</th>
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">Datos</th>
                  </tr>
                </thead>
                <tbody>
                  {historialRows.slice(0, 30).map((row, i) => (
                    <tr key={i} className="border-b border-[#1E293B] hover:bg-[#0F172A]/60">
                      <td className="px-3 py-2 text-blue-400 font-mono">{row.fecha}</td>
                      <td className="px-3 py-2 text-[#F8FAFC] font-medium">{row.nombre}</td>
                      <td className="px-3 py-2 text-[#64748B] truncate max-w-xs">
                        {[row.notas, row.tareas, row.estabilidad].filter(Boolean)[0] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {historialRows.length > 30 && (
              <p className="text-xs text-[#475569] mt-1.5 text-right">
                + {historialRows.length - 30} registros más...
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300">
              Los proyectos que no existan se crean automáticamente con el nombre.
              Después puedes editar cada uno para agregar URL, usuario, clave, etc.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={reset}>Cambiar archivo</Button>
            <Button onClick={handleImportMonitoring}>
              Guardar {historialRows.length} registros históricos
            </Button>
          </div>
        </div>
      )}

      {/* ── Preview ── */}
      {step === 'preview' && mode === 'complete' && (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0F1E] border border-[#1E293B]">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Proyectos</p>
                <p className="font-semibold text-[#F8FAFC]">{projectRows.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0F1E] border border-[#1E293B]">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Registros históricos</p>
                <p className="font-semibold text-[#F8FAFC]">{historialRows.length}
                  {datesSummary && <span className="text-xs text-[#475569] font-normal ml-1.5">({datesSummary})</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Projects preview */}
          <div>
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Proyectos a importar</p>
            <div className="rounded-xl border border-[#1E293B] overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A0F1E] border-b border-[#1E293B]">
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">Proyecto</th>
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">Maquetador</th>
                    <th className="px-3 py-2 text-left text-[#475569] font-medium">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map((row, i) => (
                    <tr key={i} className="border-b border-[#1E293B] hover:bg-[#0F172A]/60">
                      <td className="px-3 py-2 text-[#F8FAFC] font-medium">{row.nombre}</td>
                      <td className="px-3 py-2 text-[#94A3B8]">{row.maquetador || '—'}</td>
                      <td className="px-3 py-2 text-[#64748B] truncate max-w-xs">{row.url || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Si un proyecto ya existe, sus datos serán actualizados. Los registros de monitoreo se guardan por fecha sin duplicar.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={reset}>Cambiar archivo</Button>
            <Button onClick={handleImportComplete}>
              Importar {projectRows.length} proyectos + {historialRows.length} registros
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && mode === 'legacy' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#94A3B8]">
              Se importarán <span className="text-emerald-400 font-semibold">{legacyRows.length} proyectos</span>
            </p>
            <Button variant="ghost" size="sm" onClick={reset}>Cambiar archivo</Button>
          </div>

          <div className="rounded-xl border border-[#1E293B] overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0F1E] border-b border-[#1E293B]">
                  <th className="px-3 py-2 text-left text-[#475569] font-medium">Proyecto</th>
                  <th className="px-3 py-2 text-left text-[#475569] font-medium">Maquetador</th>
                  <th className="px-3 py-2 text-left text-[#475569] font-medium">Estado</th>
                  <th className="px-3 py-2 text-left text-[#475569] font-medium">Monitoreo</th>
                </tr>
              </thead>
              <tbody>
                {legacyRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#1E293B] hover:bg-[#0F172A]/60">
                    <td className="px-3 py-2 text-[#F8FAFC] font-medium">{row.nombre}</td>
                    <td className="px-3 py-2 text-[#94A3B8]">{row.maquetador || '—'}</td>
                    <td className="px-3 py-2 text-[#94A3B8]">{row.url || '—'}</td>
                    <td className="px-3 py-2 text-[#64748B]">
                      {row.notas || row.tareas_ejecutar ? '✓ Con datos' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Si un proyecto ya existe con el mismo nombre, sus datos serán actualizados (no duplicados).
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={reset}>Cancelar</Button>
            <Button onClick={handleImportLegacy}>Importar {legacyRows.length} proyectos</Button>
          </div>
        </div>
      )}

      {/* ── Importing ── */}
      {step === 'importing' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>{importStatus || 'Importando...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {mode === 'legacy' && (
            <div className="max-h-48 w-full overflow-y-auto flex flex-col gap-1">
              {legacyRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded">
                  {row._status === 'ok'      && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                  {row._status === 'error'   && <XCircle     className="w-3 h-3 text-red-400 shrink-0" />}
                  {row._status === 'pending' && <div className="w-3 h-3 rounded-full border border-[#334155] shrink-0" />}
                  <span className={
                    row._status === 'ok'    ? 'text-[#94A3B8]' :
                    row._status === 'error' ? 'text-red-400' : 'text-[#475569]'
                  }>{row.nombre}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-5 py-8">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
          <div className="text-center">
            <p className="font-heading font-semibold text-lg text-[#F8FAFC]">Importación completa</p>
            <div className="flex flex-col gap-1 mt-2">
              {results.projects > 0 && (
                <p className="text-sm text-[#94A3B8]">
                  <span className="text-blue-400 font-semibold">{results.projects} proyectos</span> creados / actualizados
                </p>
              )}
              {results.monitoring > 0 && (
                <p className="text-sm text-[#94A3B8]">
                  <span className="text-amber-400 font-semibold">{results.monitoring} registros históricos</span> guardados
                </p>
              )}
              {results.errors > 0 && (
                <p className="text-sm text-red-400">
                  <span className="font-semibold">{results.errors} errores</span>
                </p>
              )}
            </div>
          </div>

          {mode === 'legacy' && results.errors > 0 && (
            <div className="w-full max-h-32 overflow-y-auto flex flex-col gap-1">
              {legacyRows.filter(r => r._status === 'error').map((r, i) => (
                <p key={i} className="text-xs text-red-400 px-2">✗ {r.nombre}: {r._error}</p>
              ))}
            </div>
          )}

          <Button onClick={() => { reset(); onClose() }}>Cerrar</Button>
        </div>
      )}
    </Modal>
  )
}
