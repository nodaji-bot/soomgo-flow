import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SoomgoFlow - AI 영업 자동화',
  description: 'AI 기반 숨고 영업 자동화 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}