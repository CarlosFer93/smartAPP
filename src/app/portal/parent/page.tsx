'use client'

import { LogOut, Bell, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// PORTAL PADRES DE FAMILIA
// ============================================================

const dominioMaterias = [
  { nombre: 'Matemáticas', emoji: '📐', estado: 'optimo', porcentaje: 82 },
  { nombre: 'Lectura Crítica', emoji: '📖', estado: 'en-progreso', porcentaje: 61 },
  { nombre: 'Biología', emoji: '🧬', estado: 'reforzando', porcentaje: 38 },
  { nombre: 'Física', emoji: '⚡', estado: 'en-progreso', porcentaje: 55 },
  { nombre: 'Química', emoji: '🧪', estado: 'reforzando', porcentaje: 42 },
  { nombre: 'Sociales', emoji: '🌍', estado: 'optimo', porcentaje: 77 },
  { nombre: 'Inglés', emoji: '🇬🇧', estado: 'en-progreso', porcentaje: 64 },
]

const estadoConfig = {
  optimo:      { label: '🟢 Óptimo',          bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', barColor: 'bg-smart-green' },
  'en-progreso': { label: '🟡 En Progreso',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   barColor: 'bg-amber-400' },
  reforzando:  { label: '🔴 IA Reforzando',   bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     barColor: 'bg-red-400' },
}

export default function ParentPortal() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-cream-bg">
      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-cream-border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">👨‍👩‍👧</span>
          <div>
            <span className="font-bold text-smart-blue text-sm block">Portal Familiar</span>
            <span className="text-xs text-stone-400">Smart Preu — Supervisión</span>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 pb-16 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-extrabold text-smart-blue">
          Seguimiento de Mateo Gómez
        </h1>

        {/* ALERTA CRÍTICA DE ASISTENCIA */}
        <div className="bg-red-600 text-white rounded-2xl p-5 flex items-start gap-4 shadow-lg animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">⚠️ Alerta de Asistencia Presencial</h2>
            <p className="text-red-100 text-sm mt-1">
              Mateo <strong>no asistió</strong> a la sesión presencial del <strong>martes 22 de julio</strong> en la sede Smart Preu. Por favor comuníquese con secretaría.
            </p>
            <button className="mt-3 bg-white text-red-600 font-bold text-xs px-4 py-2 rounded-xl hover:bg-red-50 transition">
              📞 Contactar Secretaría
            </button>
          </div>
        </div>

        {/* Semáforo de dominio por materia */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-sm">
          <h2 className="font-extrabold text-smart-blue mb-1">Semáforo de Dominio por Materia</h2>
          <p className="text-xs text-stone-400 mb-4">Actualizado en tiempo real con la actividad de Mateo</p>
          <div className="space-y-3">
            {dominioMaterias.map(materia => {
              const cfg = estadoConfig[materia.estado as keyof typeof estadoConfig]
              return (
                <div key={materia.nombre} className={`flex items-center gap-4 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <span className="text-xl shrink-0">{materia.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-stone-800">{materia.nombre}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.text}`}>{cfg.label}</span>
                    </div>
                    <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`} style={{ width: `${materia.porcentaje}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-stone-700 shrink-0">{materia.porcentaje}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-sm">
          <h2 className="font-extrabold text-smart-blue mb-4">Actividad Reciente en Casa</h2>
          <div className="space-y-3">
            {[
              { text: 'Completó la Lección: Ecuaciones Cuadráticas', time: 'Hoy, 4:22 PM', ok: true },
              { text: 'Repaso Inteligente — 3 reactivos de Trigonometría', time: 'Hoy, 3:45 PM', ok: true },
              { text: 'No completó la lección de Termodinámica (IA reforzando)', time: 'Ayer, 6:10 PM', ok: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.ok
                  ? <CheckCircle2 className="w-5 h-5 text-smart-green shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="text-sm text-stone-700 font-medium">{item.text}</p>
                  <span className="text-xs text-stone-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
