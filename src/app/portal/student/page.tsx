'use client'

import { GraduationCap, LogOut, BookOpen, Zap, Clock, Target, TrendingUp } from 'lucide-react'
import { useAuth, MATERIAS } from '@/hooks/useAuth'
import ReactivoDemo from '@/components/reactivos/ReactivoDemo'

// ============================================================
// PORTAL ESTUDIANTE
// ============================================================

export default function StudentPortal() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-cream-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-cream-bg sticky top-0 z-40 border-b border-cream-border/60">
        <div className="flex items-center gap-2 font-bold text-smart-blue">
          <GraduationCap className="w-6 h-6 text-smart-green" />
          <span className="text-lg">Smart Preu</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-stone-600 hidden md:inline">
            ¡Hola, {user?.fullName?.split(' ')[0] || 'Estudiante'}!
          </span>
          <div className="w-9 h-9 rounded-full bg-smart-blue text-white font-bold flex items-center justify-center text-sm shadow">
            {user?.fullName?.slice(0, 2).toUpperCase() || 'ES'}
          </div>
          <button
            onClick={logout}
            className="text-stone-400 hover:text-red-500 transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 pb-16 space-y-8 animate-fade-in">

        {/* Banner Pacing Engine */}
        <div className="bg-gradient-to-r from-smart-blue to-smart-blueDark text-white rounded-3xl p-6 md:p-8 shadow-smart-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-smart-green/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 bg-smart-green/20 text-smart-green border border-smart-green/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Ritmo Recomendado por Inteligencia Artificial
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                ¡Faltan 20 días para la prueba y te faltan 10 lecciones!
              </h2>
              <p className="text-stone-200 text-sm leading-relaxed">
                Para terminar todo el material a tiempo, dedica al menos{' '}
                <strong className="text-smart-greenLight underline decoration-smart-green decoration-2">
                  45 minutos diarios
                </strong>{' '}
                a tu entrenamiento.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-5 shrink-0 z-10">
              <div className="text-center px-2">
                <span className="text-4xl font-extrabold text-smart-green block font-mono">20</span>
                <span className="text-[10px] text-stone-300 uppercase font-semibold tracking-wider">Días para ICFES</span>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center px-2">
                <span className="text-4xl font-extrabold text-white block font-mono">45</span>
                <span className="text-[10px] text-stone-300 uppercase font-semibold tracking-wider">Min / Día</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Tasa de Aciertos Global', value: '78.5%', sub: '+4.2% esta semana', icon: '🎯', color: 'text-smart-blue', positive: true },
            { label: 'Aciertos a la 1ª en Repasos', value: '42 / 50', sub: '84% efectividad pura', icon: '⚡', color: 'text-smart-green', positive: true },
            { label: 'Meta Semanal', value: '80%', sub: '4 / 5 hrs completadas', icon: '📊', color: 'text-stone-900', progress: 80, positive: true },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white p-5 rounded-2xl border border-cream-border shadow-sm flex items-center justify-between hover:border-stone-300 transition">
              <div className="w-full">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">{kpi.label}</span>
                <span className={`text-3xl font-extrabold mt-1 block ${kpi.color}`}>{kpi.value}</span>
                {kpi.progress !== undefined && (
                  <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2">
                    <div className="bg-smart-green h-full rounded-full" style={{ width: `${kpi.progress}%` }} />
                  </div>
                )}
                <span className={`text-xs font-semibold flex items-center gap-1 mt-1 ${kpi.positive ? 'text-smart-green' : 'text-red-500'}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {kpi.sub}
                </span>
              </div>
              <div className="text-2xl ml-4">{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Selección de modo */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Modo Estudio */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-stone-200/80 hover:border-smart-blue transition-all flex flex-col justify-between shadow-sm group animate-on-hover">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-smart-blue" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-smart-blue">Aprendizaje Guiado</span>
                <h2 className="text-2xl font-bold text-stone-900 mt-1">Modo Estudio</h2>
                <p className="text-stone-500 text-sm mt-2 leading-relaxed">
                  Domina las materias lección por lección. Videos, teoría y ejercicios paso a paso en las 7 áreas evaluadas.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-600">
                <span>Progreso general:</span>
                <span className="bg-smart-blue/10 text-smart-blue px-2.5 py-1 rounded-full font-bold">48% Completado</span>
              </div>
            </div>
            <button className="btn-secondary mt-6">
              <span>Explorar Todas las Materias</span>
            </button>
          </div>

          {/* Repaso Inteligente */}
          <div className="bg-cream-card rounded-3xl p-6 md:p-8 border-2 border-smart-green/40 hover:border-smart-green transition-all flex flex-col justify-between shadow-sm group relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-smart-green/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-smart-green/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-smart-green fill-smart-green" />
                </div>
                <span className="bg-smart-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  ✨ IA Adaptativa
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-smart-green">Entrenamiento Dinámico</span>
                <h2 className="text-2xl font-bold text-stone-900 mt-1">Repaso Inteligente</h2>
                <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                  El algoritmo analiza tu historial y genera sesiones enfocadas en corregir tus falencias específicas.
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  Debilidades detectadas:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Trigonometría', 'Termodinámica', 'Fracciones Algebraicas'].map(t => (
                    <span key={t} className="bg-amber-50 text-amber-800 border border-amber-200/60 text-xs px-2.5 py-1 rounded-lg font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-primary mt-6">
              ▶ Iniciar Sesión Adaptativa
            </button>
          </div>
        </div>

        {/* Demo ReactivoViewer */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-800">Demo — Reactivo con LaTeX</h3>
            <span className="badge-info">ReactivoViewer v1</span>
          </div>
          <ReactivoDemo />
        </div>

      </main>
    </div>
  )
}
