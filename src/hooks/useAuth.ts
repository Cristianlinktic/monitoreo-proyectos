'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { MonitoreoRol } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signOut }
}

// Rol en Monitor (public.monitoreo_miembros). Una sesión sin fila ahí no ve
// nada: RLS lo bloquea en la base, esto solo sirve para explicarlo en pantalla.
export function useMonitoreoRol(userId: string | null | undefined) {
  const [rol, setRol] = useState<MonitoreoRol | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase.rpc('monitoreo_rol').then(({ data, error }) => {
      if (cancelled) return
      setRol((data as MonitoreoRol | null) ?? null)
      setError(!!error)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [userId])

  return { rol, loading, error }
}
