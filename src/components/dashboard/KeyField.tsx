'use client'

import { Input } from '@/components/ui/Input'

interface KeyFieldProps {
  value: string
  onChange: (value: string) => void
  hasKey: boolean
  remove: boolean
  onRemoveChange: (remove: boolean) => void
}

// La clave guardada vive en Supabase Vault y nunca se precarga aquí:
// vacío = no tocarla, escribir = reemplazarla, la casilla = borrarla.
export function KeyField({ value, onChange, hasKey, remove, onRemoveChange }: KeyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Input
        label="Clave"
        type="password"
        autoComplete="new-password"
        placeholder={hasKey ? 'Guardada · escribe para reemplazarla' : '••••••••'}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={remove}
      />
      {hasKey && (
        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer" style={{ color: 'var(--text-faint)' }}>
          <input type="checkbox" checked={remove} onChange={e => onRemoveChange(e.target.checked)} />
          Quitar la clave guardada
        </label>
      )}
    </div>
  )
}
