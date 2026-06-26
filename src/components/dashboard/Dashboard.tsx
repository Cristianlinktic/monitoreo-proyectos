'use client'

import { useState } from 'react'
import { ServerCrash } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { MetricsPanel } from '@/components/dashboard/MetricsPanel'
import { ProjectsTable } from '@/components/dashboard/ProjectsTable'
import { ProjectFormModal } from '@/components/dashboard/ProjectFormModal'
import { ImportModal } from '@/components/dashboard/ImportModal'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ToastProvider } from '@/components/ui/Toast'
import { useMonitoring } from '@/hooks/useMonitoring'

function DashboardContent() {
  const { projects, availableDates, selectedDate, setSelectedDate, loading, error, refetch } =
    useMonitoring()
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [showOnlyPending, setShowOnlyPending] = useState(false)

  return (
    <>
      <Header
        selectedDate={selectedDate}
        availableDates={availableDates}
        onDateChange={setSelectedDate}
        onNewProject={() => setNewProjectOpen(true)}
        onImport={() => setImportOpen(true)}
      />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="orb w-[600px] h-[600px] -top-64 -left-64 opacity-[0.04]"
          style={{ background: '#22C55E' }} />
        <div className="orb w-[500px] h-[500px] top-1/2 -right-48 opacity-[0.04]"
          style={{ background: '#06B6D4' }} />
        <div className="orb w-[400px] h-[400px] bottom-0 left-1/3 opacity-[0.03]"
          style={{ background: '#8B5CF6' }} />
      </div>

      <main className="relative max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5" style={{ zIndex: 1 }}>
        <StatsBar
          projects={projects}
          selectedDate={selectedDate}
          loading={loading}
          showOnlyPending={showOnlyPending}
          onTogglePending={() => setShowOnlyPending(p => !p)}
        />

        <MetricsPanel projects={projects} totalProjects={projects.length} />

        <HeatmapCalendar totalProjects={projects.length} onDateChange={setSelectedDate} />

        {error ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <ServerCrash className="w-10 h-10 text-red-400" />
            <p className="text-sm text-[#94A3B8]">{error}</p>
            <button onClick={refetch} className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
              Reintentar
            </button>
          </div>
        ) : (
          <ProjectsTable
            projects={projects}
            selectedDate={selectedDate}
            onRefresh={refetch}
            loading={loading}
            showOnlyPending={showOnlyPending}
            onClearPending={() => setShowOnlyPending(false)}
          />
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
