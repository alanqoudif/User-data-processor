import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'معالج بيانات المستخدمين | User Data Processor',
  description: 'أداة لتحويل ملفات Excel إلى CSV بتنسيق محدد',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </body>
    </html>
  )
} 