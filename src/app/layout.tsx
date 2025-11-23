import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

// Source Sans 3 is the updated version of Source Sans Pro with the same design
const sourceSansPro = Source_Sans_3({ 
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans-pro',
})

export const metadata: Metadata = {
  title: 'Langscope - LLM Evaluation Platform',
  description: 'Battle-tested LLM rankings with secure data verification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sourceSansPro.variable}>
      <body className={sourceSansPro.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

