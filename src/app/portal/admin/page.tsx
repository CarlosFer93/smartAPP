'use client'

import { useState } from 'react'
import { LogOut, CheckSquare, XSquare, MessageCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// PORTAL SECRETARÍA / ADMINISTRACIÓN
// ============================================================

const estudiantes = [
  { id: '1', nombre: 'Mateo Gómez', avatar: 'MG', asistencia: null as null | boolean },
  { id: '2', nombre: 'Valentina Ríos', avatar: 'VR', asistencia: null as null | boolean },
  { id: '3', nombre: 'Sebastián Torres', avatar: 'ST', asistencia: null as null | boolean },
  { id: '4', nombre: 'Camila Herrera', avatar: 'CH', asistencia: null as null | boolean },
  { id: '5', nombre: 'Juan Fernández', avatar: 'JF', asistencia: null as null | boolean },
  { id: '6', nombre: 'Luisa Morales', avatar: 'LM', asistencia: null as null | boolean },
]

export default function AdminPortal() {
  const { logout } = useAuth()
  const [lista, setLista] = useState(estudiantes)
  const [guardado, setGuardado] = useState(false)

  function marcarAsistencia(id: string, estado: boolean) {
    setLista(prev => prev.map(e => e.id === id ? { ...e, asistencia: estado } : e))
    setGuardado(false)
  }

  function guardarAsistencia() {
    // TODO: Enviar a InsForge y disparar alerta a padres de ausentes
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const presentes = lista.filter(e => e.asistencia === true).length
  const ausentes = lista.filter(e => e.asistencia === false).length

  return (
    <div className="min-h-screen bg-cream-bg">
      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-cream-border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">🏛️</span>
          <div>
            <span className="font-bold text-smart-blue text-sm block">Portal Secretaría</span>
            <span className="text-xs text-stone-400">Smart Preu — Administración</span>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8 pb-16 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-smart-blue">Asistencia a 1 Clic</h1>
            <p className="text-sm text-stone-500">Sesión: Miércoles 23 julio 2026 · Grupo A</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-smart-greenLight text-smart-greenHover px-4 py-2 rounded-xl font-extrabold text-lg">{presentes}<span className="block text-xs font-semibold">✅ Pres.</span></div>
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-extrabold text-lg">{ausentes}<span className="block text-xs font-semibold">❌ Aus.</span></div>
          </div>
        </div>

        {/* Lista de asistencia */}
        <div className="bg-white rounded-2xl border border-cream-border shadow-sm divide-y divide-stone-100">
          {lista.map(est => (
            <div key={est.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${
              est.asistencia === true  ? 'bg-emerald-50/40' :
              est.asistencia === false ? 'bg-red-50/40' : ''
            }`}>
              <div className="w-10 h-10 rounded-full bg-smart-blue text-white font-bold flex items-center justify-center text-sm shrink-0">
                {est.avatar}
              </div>
              <span className="flex-1 font-semibold text-stone-800 text-sm">{est.nombre}</span>

              {/* Estado visual */}
              {est.asistencia === null && (
                <span className="text-xs text-stone-400 italic">Sin registrar</span>
              )}
              {est.asistencia === true && (
                <span className="badge-success">✅ Presente</span>
              )}
              {est.asistencia === false && (
                <span className="badge-danger">❌ Ausente</span>
              )}

              {/* Botones 1 clic */}
              <div className="flex gap-2">
                <button
                  onClick={() => marcarAsistencia(est.id, true)}
                  className={`p-2 rounded-xl transition ${est.asistencia === true ? 'bg-smart-green text-white' : 'bg-stone-100 text-stone-500 hover:bg-smart-greenLight hover:text-smart-greenHover'}`}
                  title="Marcar presente"
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => marcarAsistencia(est.id, false)}
                  className={`p-2 rounded-xl transition ${est.asistencia === false ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500'}`}
                  title="Marcar ausente"
                >
                  <XSquare className="w-5 h-5" />
                </button>
                {est.asistencia === false && (
                  <button
                    className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
                    title="Cobro amable por WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón guardar y notificar */}
        <button
          onClick={guardarAsistencia}
          className="w-full btn-primary text-base"
        >
          {guardado ? (
            <>✅ Asistencia guardada · Padres notificados</>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              Guardar Asistencia y Notificar Padres
            </>
          )}
        </button>
      </main>
    </div>
  )
}
