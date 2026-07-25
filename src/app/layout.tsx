import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'

export const metadata: Metadata = {
  title: {
    default: 'Smart Preu — Plataforma Adaptativa Saber 11',
    template: '%s | Smart Preu',
  },
  description:
    'Prepárate para el ICFES Saber 11 con Smart Preu: aprendizaje activo, adaptativo y con Tutor IA Socrático. La plataforma líder de preparación universitaria en Colombia.',
  keywords: ['ICFES', 'Saber 11', 'preuniversitario', 'Colombia', 'matemáticas', 'lectura crítica'],
  authors: [{ name: 'Smart Preu' }],
  openGraph: {
    title: 'Smart Preu — Plataforma Adaptativa Saber 11',
    description: 'Prepárate para el ICFES con IA adaptativa y Tutor Socrático.',
    type: 'website',
    locale: 'es_CO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream-bg text-stone-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
