'use client'

import { useState } from 'react'
import { Loader2, ServerCrash } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { ProjectsTable } from '@/components/dashboard/ProjectsTable'
import { ProjectFormModal } from '@/components/dashboard/ProjectFormModal'
import { ImportModal } from '@/components/dashboard/ImportModal'
import { ToastProvider } from '@/components/ui/Toast'
import { useMonitoring } from '@/hooks/useMonitoring'

function DashboardContent() {
  const { projects, availableDates, selectedDate, setSelectedDate, loading, error, refetch } =
    useMonitoring()
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <>
      <Header
        selectedDate={selectedDate}
        availableDates={availableDates}
        onDateChange={setSelectedDate}
        onNewProject={() => setNewProjectOpen(true)}
        onImport={() => setImportOpen(true)}
      />

      <main className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <StatsBar projects={projects} selectedDate={selectedDate} />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <ServerCrash className="w-10 h-10 text-red-400" />
            <p className="text-sm text-[#94A3B8]">{error}</p>
            <button onClick={refetch} className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
              Reintentar
            </button>
          </div>
        ) : (
          <ProjectsTable projects={projects} selectedDate={selectedDate} onRefresh={refetch} />
        )}
      </main>

      <ProjectFormModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onSuccess={refetch}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refetch}
      />
    </>
  )
}

export default function Home() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#020617]">
        <DashboardContent />
      </div>
    </ToastProvider>
  )
}
