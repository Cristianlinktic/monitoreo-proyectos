'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const Dashboard = dynamic(
  () => import('@/components/dashboard/Dashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    ),
  }
)

export function ClientPage() {
  return <Dashboard />
}
