import type { Metadata } from 'next'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monitor MKT · LinkTIC',
  description: 'Panel de monitoreo diario de proyectos web — LinkTIC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#020617] text-[#F8FAFC] antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
