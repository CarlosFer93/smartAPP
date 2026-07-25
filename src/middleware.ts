import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// MIDDLEWARE — Protección de rutas por rol
// ============================================================

const PORTAL_ROLE_MAP: Record<string, string> = {
  '/portal/student': 'student',
  '/portal/parent':  'parent',
  '/portal/teacher': 'teacher',
  '/portal/admin':   'admin',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo actuar en rutas de portal
  if (!pathname.startsWith('/portal')) {
    return NextResponse.next()
  }

  // Leer sesión desde cookies (el cliente debe setearla al login)
  const sessionCookie = request.cookies.get('smart_preu_session')

  if (!sessionCookie) {
    // Sin sesión → redirigir al login
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    const userRole = session?.user?.role

    // Verificar que el rol coincide con la ruta
    const requiredRole = PORTAL_ROLE_MAP[pathname.split('/').slice(0, 3).join('/')]
    if (requiredRole && userRole !== requiredRole) {
      // Redirigir al portal correcto del usuario
      const correctPortal = new URL(`/portal/${userRole}`, request.url)
      return NextResponse.redirect(correctPortal)
    }

    return NextResponse.next()
  } catch {
    // Sesión inválida → redirigir al login
    const loginUrl = new URL('/', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/portal/:path*'],
}
