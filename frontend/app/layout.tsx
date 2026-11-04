import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'

// next/font descarga la fuente al compilar y la sirve desde la propia app (sin pedirla a Google en cada visita).
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'TutorHub',
  description: 'Tutorías entre estudiantes universitarios'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
