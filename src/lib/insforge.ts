// ============================================================
// CLIENTE INSFORGE PARA SMART PREU — SDK OFICIAL
// ============================================================
// Usa @insforge/sdk para auth, base de datos e IA nativa
// Project ID: f49d118c-1d15-4c90-abe1-e9f040c3d234

import { createClient } from '@insforge/sdk'
import type { SmartUser, UserRole, InsForgeSession } from './types'

// ---- Cliente InsForge (singleton) ----
const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://iy9yd7sa.us-east.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
})

export { insforge }

// ============================================================
// AUTENTICACIÓN
// ============================================================

/**
 * Inicia sesión con email y contraseña.
 * El rol del usuario se lee desde metadata.role.
 */
export async function signIn(email: string, password: string): Promise<{
  session: InsForgeSession | null
  error: string | null
}> {
  try {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })

    if (error || !data) {
      return { session: null, error: error?.message || 'Credenciales incorrectas' }
    }

    const session: InsForgeSession = {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: ((data.user.metadata as Record<string, unknown>)?.role || 'student') as UserRole,
        fullName: (data.user.profile as Record<string, unknown>)?.name as string || data.user.email,
        avatarUrl: (data.user.profile as Record<string, unknown>)?.avatar_url as string | undefined,
        createdAt: data.user.createdAt,
      },
      accessToken: data.accessToken,
      refreshToken: '', // El SDK gestiona la sesión internamente con cookies
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hora
    }

    // Persistir sesión en localStorage Y en cookie (el middleware la lee del cookie)
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_preu_session', JSON.stringify(session))

      // Setear cookie para que el middleware del servidor la pueda leer
      const maxAge = session.expiresAt - Math.floor(Date.now() / 1000)
      document.cookie = `smart_preu_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${maxAge}; SameSite=Lax`
    }

    return { session, error: null }
  } catch (e) {
    console.error('[InsForge] signIn error:', e)
    return { session: null, error: 'Error de conexión. Intenta de nuevo.' }
  }
}

/**
 * Cierra la sesión activa.
 */
export async function signOut(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smart_preu_session')
    // Eliminar también la cookie del middleware
    document.cookie = 'smart_preu_session=; path=/; max-age=0; SameSite=Lax'
  }
  await insforge.auth.signOut()
}

/**
 * Obtiene la sesión almacenada localmente.
 */
export function getLocalSession(): InsForgeSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('smart_preu_session')
  if (!raw) return null
  try {
    const session: InsForgeSession = JSON.parse(raw)
    // Verificar si el token expiró
    if (Date.now() / 1000 > session.expiresAt) {
      localStorage.removeItem('smart_preu_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

/**
 * Obtiene el usuario actual.
 */
export function getCurrentUser(): SmartUser | null {
  return getLocalSession()?.user ?? null
}

// ============================================================
// BASE DE DATOS — FUNCIONES GENÉRICAS
// ============================================================

/**
 * Query genérico a la base de datos de InsForge.
 */
export async function query<T>(
  table: string,
  params?: Record<string, string>,
  _token?: string
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = insforge.database.from(table).select()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        q = q.eq(k, v)
      })
    }
    const { data, error } = await q
    if (error) return { data: null, error: error.message || 'Error en consulta' }
    return { data: data as T[], error: null }
  } catch (e) {
    return { data: null, error: 'Error de red' }
  }
}

// ============================================================
// TUTOR IA SOCRÁTICO — STREAMING SSE
// ============================================================

/**
 * Envía una duda al Tutor IA Socrático via Server-Sent Events.
 * REGLA: La IA NUNCA da la respuesta directa. Solo guía socráticamente.
 */
export async function streamTutorResponse(
  reactivoId: string,
  opcionIntentada: string,
  enunciado: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  token: string
): Promise<void> {
  const res = await fetch('/api/tutor/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ reactivoId, opcionIntentada, enunciado, userMessage }),
  })

  if (!res.body) {
    onChunk('Lo siento, no puedo responder en este momento.')
    onDone()
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    // Parsear SSE: "data: {content}\n\n"
    chunk.split('\n').forEach(line => {
      if (line.startsWith('data: ')) {
        const content = line.slice(6)
        if (content !== '[DONE]') onChunk(content)
      }
    })
  }
  onDone()
}
