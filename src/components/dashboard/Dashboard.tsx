'use client'

import { useState } from 'react'
import { Zap, ServerCrash } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { DateFilter } from '@/components/dashboard/DateFilter'
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
        onNewProject={() => setNewProjectOpen(true)}
        onImport={() => setImportOpen(true)}
      />

      {/* Background decoration — Aurora mesh */}
      <div className="aurora-blobs">
        <div className="aurora-blob aurora-blob-magenta" />
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-cyan" />
      </div>

      <main className="relative max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6" style={{ zIndex: 1 }}>
        <div className="flex justify-center mb-6">
          <DateFilter
            selectedDate={selectedDate}
            availableDates={availableDates}
            onChange={setSelectedDate}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">

          {/* Sidebar — stats, alerts and quick action stay visible while the table scrolls */}
          <div className="flex flex-col gap-4 lg:sticky" style={{ top: 84 }}>
            <StatsBar
              compact
              projects={projects}
              selectedDate={selectedDate}
              loading={loading}
              showOnlyPending={showOnlyPending}
              onTogglePending={() => setShowOnlyPending(p => !p)}
            />

            <DomainAlerts projects={projects} />
            <StaleProjects projects={projects} />
            <ArchivedProjects onRestore={refetch} />

            <button
              onClick={() => setQuickMonitorOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer active:scale-95"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 0 20px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(244,114,194,0.55), 0 2px 8px rgba(0,0,0,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(244,114,194,0.35), 0 2px 8px rgba(0,0,0,0.4)' }}
            >
              <Zap className="w-4 h-4" />
              Monitoreo Rápido
            </button>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-5 min-w-0">
            <MetricsPanel projects={projects} totalProjects={projects.length} />

            <HeatmapCalendar totalProjects={projects.length} onDateChange={setSelectedDate} />

            {error ? (
              <div className="flex flex-col items-center gap-3 py-24">
                <ServerCrash className="w-10 h-10" style={{ color: 'var(--danger)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button onClick={refetch} className="text-xs underline underline-offset-2 cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>
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
          </div>
        </div>
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
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <DashboardContent />
      </div>
    </ToastProvider>
  )
}
