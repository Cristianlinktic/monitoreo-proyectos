'use client'

import { Activity, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DateFilter } from '@/components/dashboard/DateFilter'

interface HeaderProps {
  selectedDate: string
  availableDates: string[]
  onDateChange: (date: string) => void
  onNewProject: () => void
  onImport: () => void
}

export function Header({ selectedDate, availableDates, onDateChange, onNewProject, onImport }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1E293B] bg-[#020617]/90 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="hidden sm:block">
            <p className="font-heading font-semibold text-sm text-[#F8FAFC] leading-none">Monitor</p>
            <p className="text-xs text-[#475569] leading-none mt-0.5">de Proyectos</p>
          </div>
        </div>

        {/* Center: Date filter */}
        <div className="flex-1 flex justify-center">
          <DateFilter selectedDate={selectedDate} availableDates={availableDates} onChange={onDateChange} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={onImport}>
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar Excel</span>
          </Button>
          <Button size="sm" onClick={onNewProject}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
