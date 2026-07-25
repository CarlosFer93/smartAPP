// ============================================================
// TIPOS GLOBALES DE SMART PREU
// ============================================================

// Roles del sistema
export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

// Usuario autenticado
export interface SmartUser {
  id: string
  email: string
  role: UserRole
  fullName: string
  avatarUrl?: string
  createdAt: string
}

// Sesión de InsForge
export interface InsForgeSession {
  user: SmartUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// ============================================================
// TIPOS DE CONTENIDO ACADÉMICO
// ============================================================

export type SubjectSlug =
  | 'matematicas'
  | 'lectura-critica'
  | 'biologia'
  | 'fisica'
  | 'quimica'
  | 'sociales'
  | 'ingles'

export interface Subject {
  id: string
  slug: SubjectSlug
  name: string
  emoji: string
  color: string
  colorClass: string
  totalModules: number
  completedModules: number
  progressPercent: number
}

export interface Module {
  id: string
  subjectId: string
  title: string
  description: string
  order: number
  totalLessons: number
  completedLessons: number
  status: 'locked' | 'active' | 'completed'
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  content: string // MDX content with LaTeX
  videoUrl?: string
  order: number
  status: 'locked' | 'active' | 'completed'
  durationMinutes: number
}

// ============================================================
// TIPOS DE REACTIVOS (Preguntas ICFES)
// ============================================================

export type OpcionLetter = 'A' | 'B' | 'C' | 'D'

export interface DistractorFeedback {
  letra: OpcionLetter
  diagnostico: string   // Explicación del error conceptual
  pista?: string        // Pista socrática para el tutor IA
}

export interface Reactivo {
  id: string
  lessonId?: string
  subjectSlug: SubjectSlug
  enunciado: string            // Texto con LaTeX
  opciones: {
    letra: OpcionLetter
    texto: string              // Texto con LaTeX
  }[]
  respuestaCorrecta: OpcionLetter
  explicacionCorrecta: string  // Por qué es correcta
  distractores: DistractorFeedback[]
  nivel: 'basico' | 'medio' | 'avanzado'
  topico: string
}

// ============================================================
// TIPOS DEL TUTOR IA SOCRÁTICO
// ============================================================

export interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface TutorSession {
  reactivoId: string
  opcionIntentada: OpcionLetter
  messages: TutorMessage[]
  dudayCount: number  // Máximo 20/día
}

// ============================================================
// TIPOS DE ASISTENCIA (Portal Secretaría)
// ============================================================

export type AsistenciaEstado = 'presente' | 'ausente' | 'sin-registrar'

export interface RegistroAsistencia {
  id: string
  studentId: string
  fecha: string
  estado: AsistenciaEstado
  registradoPor: string
}

// ============================================================
// TIPOS DEL PACING ENGINE
// ============================================================

export interface PacingData {
  diasRestantes: number
  leccionesPendientes: number
  minutosRecomendadosDia: number
  fechaIcfes: string
  progresoPorcentaje: number
}

// ============================================================
// TIPOS DE PORTAL PADRES
// ============================================================

export type SemaforoEstado = 'optimo' | 'en-progreso' | 'reforzando'

export interface DominioMateria {
  subjectSlug: SubjectSlug
  subjectName: string
  estado: SemaforoEstado
  progresoPorcentaje: number
}

export interface AlertaPadre {
  id: string
  tipo: 'asistencia' | 'progreso' | 'pago'
  mensaje: string
  urgente: boolean
  fecha: string
}
