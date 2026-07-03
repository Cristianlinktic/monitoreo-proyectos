'use client'

import { useState } from 'react'
import { Plus, X, ExternalLink, Link2 } from 'lucide-react'
import type { Redirect } from '@/lib/types'

interface Props {
  value: Redirect[]
  onChange: (redirects: Redirect[]) => void
}

const inputStyle = { background: 'rgba(3,7,18,0.8)', border: '1px solid rgba(30,41,59,0.7)' }

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'
  e.currentTarget.style.boxShadow = '0 0 12px rgba(34,197,94,0.08)'
}
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(30,41,59,0.7)'
  e.currentTarget.style.boxShadow = 'none'
}

export function RedirectsField({ value, onChange }: Props) {
  const [nombre, setNombre] = useState('')
  const [url, setUrl] = useState('')

  const add = () => {
    const n = nombre.trim()
    const u = url.trim()
    if (!n && !u) return
    onChange([...value, { nombre: n, url: u }])
    setNombre('')
    setUrl('')
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
        Redirects de formularios
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Nombre (ej: Form contacto)"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="https://.../gracias"
          className="flex-[1.6] min-w-0 px-3 py-2 rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#334155] focus:outline-none transition-all"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5 p-2 bg-[#0A0F1E] rounded-lg border border-[#1E293B] max-h-44 overflow-y-auto">
          {value.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1E293B]/60 border border-[#334155]">
              <Link2 className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
              <div className="flex-1 min-w-0">
                {r.nombre && <p className="text-xs text-[#F8FAFC] truncate">{r.nombre}</p>}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    <span className="truncate">{r.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[#475569] hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
