import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monitor de Proyectos',
  description: 'Panel de monitoreo diario de proyectos web',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#020617] text-[#F8FAFC] antialiased">
        {children}
      </body>
    </html>
  )
}
