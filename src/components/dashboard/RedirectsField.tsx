'use client'

import { useState } from 'react'
import { Plus, X, ExternalLink, Link2 } from 'lucide-react'
import type { Redirect } from '@/lib/types'

interface Props {
  value: Redirect[]
  onChange: (redirects: Redirect[]) => void
}

const inputStyle = { background: 'rgba(0,0,0,0.28)', border: '1px solid var(--border)' }

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(244,114,194,0.4)'
  e.currentTarget.style.boxShadow = '0 0 12px rgba(244,114,194,0.12)'
}
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--border)'
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
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Redirects de formularios
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Nombre (ej: Form contacto)"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm placeholder:text-[color:var(--text-faint)] focus:outline-none transition-all"
          style={{ ...inputStyle, color: 'var(--text)' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="https://.../gracias"
          className="flex-[1.6] min-w-0 px-3 py-2 rounded-lg text-sm placeholder:text-[color:var(--text-faint)] focus:outline-none transition-all"
          style={{ ...inputStyle, color: 'var(--text)' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5 p-2 rounded-lg max-h-44 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)' }}>
          {value.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)' }}>
              <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                {r.nombre && <p className="text-xs truncate" style={{ color: 'var(--text)' }}>{r.nombre}</p>}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] hover:opacity-80"
                    style={{ color: 'var(--cyan)' }}
                  >
                    <span className="truncate">{r.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="transition-colors cursor-pointer shrink-0"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)' }}
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
