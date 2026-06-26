'use client'

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface DateFilterProps {
  selectedDate: string
  availableDates: string[]
  onChange: (date: string) => void
}

export function DateFilter({ selectedDate, availableDates, onChange }: DateFilterProps) {
  const today = new Date().toISOString().split('T')[0]

  const goToPrev = () => {
    const idx = availableDates.indexOf(selectedDate)
    if (idx < availableDates.length - 1) onChange(availableDates[idx + 1])
  }

  const goToNext = () => {
    const idx = availableDates.indexOf(selectedDate)
    if (idx > 0) onChange(availableDates[idx - 1])
  }

  const hasPrev = availableDates.indexOf(selectedDate) < availableDates.length - 1
  const hasNext = availableDates.indexOf(selectedDate) > 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-[#0F172A] border border-[#1E293B] rounded-xl p-1">
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Fecha anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3 min-w-44">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-sm text-[#F8FAFC] focus:outline-none cursor-pointer w-full"
          />
        </div>

        <button
          onClick={goToNext}
          disabled={!hasNext}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Fecha siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {selectedDate !== today && (
        <Button variant="ghost" size="sm" onClick={() => onChange(today)}>
          Hoy
        </Button>
      )}

      <span className="text-xs text-[#475569] hidden sm:block">
        {formatDate(selectedDate)}
      </span>
    </div>
  )
}
