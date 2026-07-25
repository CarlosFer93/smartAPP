'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, getCurrentUser, getLocalSession } from '@/lib/insforge'
import type { SmartUser, UserRole } from '@/lib/types'

// ============================================================
// HOOK: useAuth — Gestión de autenticación y rol
// ============================================================

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Ruta de portal según el rol del usuario.
   * El rol viene de InsForge (user_metadata.role).
   */
  function getPortalRoute(role: UserRole): string {
    const routes: Record<UserRole, string> = {
      student: '/portal/student',
      parent:  '/portal/parent',
      teacher: '/portal/teacher',
      admin:   '/portal/admin',
    }
    return routes[role]
  }

  /**
   * Login con email + contraseña → redirige al portal del rol.
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    const { session, error: authError } = await signIn(email, password)

    if (authError || !session) {
      setError(authError || 'Error desconocido')
      setIsLoading(false)
      return
    }

    // Redirigir al portal correspondiente al rol
    router.push(getPortalRoute(session.user.role))
    setIsLoading(false)
  }, [router])

  /**
   * Cerrar sesión → volver al login
   */
  const logout = useCallback(async () => {
    await signOut()
    router.push('/')
  }, [router])

  /**
   * Obtener usuario actual (desde localStorage)
   */
  const user = getCurrentUser()
  const session = getLocalSession()

  return {
    user,
    session,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!session,
  }
}

// ============================================================
// HOOK: useRole — Acceso rápido al rol activo
// ============================================================

export function useRole(): UserRole | null {
  const user = getCurrentUser()
  return user?.role ?? null
}

// ============================================================
// CONSTANTES DE MATERIAS
// ============================================================

export const MATERIAS = [
  { slug: 'matematicas',    name: 'Matemáticas',      emoji: '📐', color: '#3B82F6', colorClass: 'blue' },
  { slug: 'lectura-critica', name: 'Lectura Crítica', emoji: '📖', color: '#8B5CF6', colorClass: 'violet' },
  { slug: 'biologia',       name: 'Biología',          emoji: '🧬', color: '#10B981', colorClass: 'emerald' },
  { slug: 'fisica',         name: 'Física',            emoji: '⚡', color: '#F59E0B', colorClass: 'amber' },
  { slug: 'quimica',        name: 'Química',           emoji: '🧪', color: '#EF4444', colorClass: 'red' },
  { slug: 'sociales',       name: 'Ciencias Sociales', emoji: '🌍', color: '#0F3E6D', colorClass: 'smart-blue' },
  { slug: 'ingles',         name: 'Inglés',            emoji: '🇬🇧', color: '#EC4899', colorClass: 'pink' },
] as const
