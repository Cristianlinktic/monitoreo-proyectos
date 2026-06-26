'use client'

import { useState } from 'react'
import { Zap, ServerCrash } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { MetricsPanel } from '@/components/dashboard/MetricsPanel'
import { ProjectsTable } from '@/components/dashboard/ProjectsTable'
import { ProjectFormModal } from '@/components/dashboard/ProjectFormModal'
import { ImportModal } from '@/components/dashboard/ImportModal'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { DomainAlerts } from '@/components/dashboard/DomainAlerts'
import { StaleProjects } from '@/components/dashboard/StaleProjects'
import { ArchivedProjects } from '@/components/dashboard/ArchivedProjects'
import { QuickMonitor } from '@/components/dashboard/QuickMonitor'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ToastProvider } from '@/components/ui/Toast'
import { useMonitoring } from '@/hooks/useMonitoring'

function DashboardContent() {
  const { projects, availableDates, selectedDate, setSelectedDate, loading, error, refetch } =
    useMonitoring()
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [quickMonitorOpen, setQuickMonitorOpen] = useState(false)

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

        <DomainAlerts projects={projects} />
        <StaleProjects projects={projects} />
        <ArchivedProjects onRestore={refetch} />

        <MetricsPanel projects={projects} totalProjects={projects.length} />

        <HeatmapCalendar totalProjects={projects.length} onDateChange={setSelectedDate} />

        {/* Quick Monitor button */}
        <div className="flex justify-end">
          <button
            onClick={() => setQuickMonitorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              boxShadow: '0 0 20px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              color: '#020617',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(34,197,94,0.55), 0 2px 8px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.4)' }}
          >
            <Zap className="w-4 h-4" />
            Monitoreo Rápido
          </button>
        </div>

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

      {quickMonitorOpen && (
        <QuickMonitor
          projects={projects}
          selectedDate={selectedDate}
          onRefresh={refetch}
          onClose={() => setQuickMonitorOpen(false)}
        />
      )}

      <CommandPalette
        projects={projects}
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNewProject={() => setNewProjectOpen(true)}
        onImport={() => setImportOpen(true)}
        onQuickMonitor={() => setQuickMonitorOpen(true)}
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
