'use client'

import { useState, FormEvent } from 'react'
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// PÁGINA: Login principal de Smart Preu
// El rol se determina por las credenciales del usuario en InsForge.
// ============================================================

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    await login(email, password)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 py-12 bg-gradient-to-br from-cream-bg via-white to-smart-blue/5 animate-fade-in">

      {/* Logo y marca */}
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex p-4 bg-smart-blue/10 rounded-3xl mb-2 shadow-sm">
          <GraduationCap className="w-12 h-12 text-smart-green" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-smart-blue">Smart Preu</h1>
        <p className="text-stone-500 font-medium">
          Plataforma de Aprendizaje Adaptativo &bull; Saber 11
        </p>
        <span className="inline-block bg-smart-green/10 text-smart-green text-xs font-bold px-3 py-1 rounded-full border border-smart-green/20 uppercase tracking-wider">
          Preparación ICFES Colombia
        </span>
      </div>

      {/* Tarjeta de login */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-smart-lg border border-cream-border p-8 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-smart-blue">Iniciar Sesión</h2>
          <p className="text-xs text-stone-400 mt-1">
            Tu portal se abre automáticamente según tu perfil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@smartpreu.edu.co"
                required
                className="w-full pl-9 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-smart-blue focus:ring-2 focus:ring-smart-blue/10 text-stone-700 font-medium transition"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-smart-blue focus:ring-2 focus:ring-smart-blue/10 text-stone-700 font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error de autenticación */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Botón de login */}
          <button
            id="btn-login"
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-smart-green hover:bg-smart-greenHover text-white font-bold py-3.5 rounded-xl shadow-green transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Ingresar a Smart Preu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Olvidé contraseña */}
        <div className="text-center">
          <a href="#" className="text-xs text-smart-blue hover:underline font-semibold">
            Olvidé mi contraseña
          </a>
        </div>

        {/* Indicador de roles */}
        <div className="border-t border-stone-100 pt-4">
          <p className="text-xs text-stone-400 text-center mb-3 font-medium">
            Tu portal se activa automáticamente según tu rol:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: '🎓', label: 'Estudiante', color: 'text-smart-blue' },
              { emoji: '👨‍👩‍👧', label: 'Padre / Familia', color: 'text-red-500' },
              { emoji: '👨🏽‍🏫', label: 'Docente', color: 'text-stone-600' },
              { emoji: '🏛️', label: 'Secretaría', color: 'text-smart-blue' },
            ].map(({ emoji, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                <span>{emoji}</span>
                <span className={`font-semibold ${color}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-400 mt-6">
        Smart Preu © 2026 &bull; Preparación ICFES Saber 11 Colombia
      </p>
    </main>
  )
}
