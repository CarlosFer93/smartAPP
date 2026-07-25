'use client'

import { LogOut, PlusCircle, Sparkles, BarChart2, BookOpen } from 'lucide-react'
import { useAuth, MATERIAS } from '@/hooks/useAuth'

// ============================================================
// PORTAL DOCENTE
// ============================================================

export default function TeacherPortal() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-cream-bg">
      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-cream-border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">👨🏽‍🏫</span>
          <div>
            <span className="font-bold text-stone-800 text-sm block">Portal Docente</span>
            <span className="text-xs text-stone-400">Smart Preu — Gestión de Contenido</span>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 pb-16 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-smart-blue">
            Bienvenido, Prof. {user?.fullName?.split(' ')[0] || 'Docente'}
          </h1>
          <button className="btn-primary text-sm">
            <PlusCircle className="w-4 h-4" />
            Nueva Lección
          </button>
        </div>

        {/* Ingesta Mágica con IA */}
        <div className="bg-gradient-to-r from-smart-blue to-smart-blueLight text-white rounded-2xl p-6 flex items-start gap-4 shadow-smart">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-lg">✨ Ingesta Mágica con Gemini AI</h2>
            <p className="text-blue-100 text-sm mt-1 leading-relaxed">
              Pega un JSON autogenerado desde un PDF y el sistema crea automáticamente preguntas, fórmulas LaTeX y explicaciones socráticas.
            </p>
            <button className="mt-4 bg-white text-smart-blue font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition">
              Abrir Modal de Ingesta
            </button>
          </div>
        </div>

        {/* Materias y sus lecciones */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATERIAS.map(materia => (
            <div key={materia.slug} className="card-interactive p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{materia.emoji}</span>
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">{materia.name}</h3>
                  <span className="text-xs text-stone-400">12 lecciones · 45 reactivos</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 text-xs font-bold text-smart-blue bg-smart-blue/10 hover:bg-smart-blue/20 py-2 rounded-lg transition flex items-center justify-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button className="flex-1 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 py-2 rounded-lg transition flex items-center justify-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Analítica
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
