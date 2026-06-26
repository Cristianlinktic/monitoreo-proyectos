'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMonitoringByDate } from '@/services/monitoring.service'
import { getAvailableDates } from '@/services/monitoring.service'
import { todayISO } from '@/lib/utils'
import type { ProjectWithMonitoring } from '@/lib/types'

export function useMonitoring() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO())
  const [projects, setProjects] = useState<ProjectWithMonitoring[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)
    try {
      const [data, dates] = await Promise.all([
        getMonitoringByDate(date),
        getAvailableDates(),
      ])
      setProjects(data)
      setAvailableDates(dates)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  return {
    projects,
    availableDates,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    refetch: () => fetchData(selectedDate),
  }
}
