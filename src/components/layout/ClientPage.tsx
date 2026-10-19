'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, ShieldOff } from 'lucide-react'
import { useAuth, useMonitoreoRol } from '@/hooks/useAuth'

const Dashboard = dynamic(
  () => import('@/components/dashboard/Dashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    ),
  }
)

export function ClientPage() {
  const { user, loading, signOut } = useAuth()
  const { rol, loading: rolLoading, error: rolError } = useMonitoreoRol(user?.id)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || (user && rolLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) return null

  // Si la consulta del rol falla no se bloquea aquí: quien decide es RLS.
  if (!rol && !rolError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-sm text-center flex flex-col items-center gap-3">
          <ShieldOff className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Tu cuenta no tiene acceso a Monitor</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {user.email} inició sesión, pero no está habilitada. Pide acceso a un administrador.
          </p>
          <button onClick={signOut} className="mt-2 text-xs underline cursor-pointer" style={{ color: 'var(--accent)' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
