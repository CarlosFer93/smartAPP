'use client'

import { useState, useEffect } from 'react'
import ReactivoViewer from './ReactivoViewer'
import { insforge } from '@/lib/insforge'
import type { Reactivo, OpcionLetter } from '@/lib/types'
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ReactivoDemo() {
  const [reactivos, setReactivos] = useState<Reactivo[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReactivos() {
      try {
        setLoading(true)
        const { data, error: dbErr } = await insforge.database.from('reactivos').select('*')
        
        if (dbErr || !data || data.length === 0) {
          setError(dbErr?.message || 'No se encontraron reactivos en la base de datos.')
          return
        }

        // Mapear los datos de InsForge a la interfaz Reactivo
        const mapped: Reactivo[] = data.map((r: Record<string, any>) => {
          const getDistractorInfo = (letra: OpcionLetter) => {
            let diag = r[`diagnostico_${letra.toLowerCase()}`] || ''
            let pista = r[`pista_${letra.toLowerCase()}`] || undefined
            if (Array.isArray(r.distractores)) {
              const found = r.distractores.find((d: any) => d.letra === letra)
              if (found) {
                if (!diag) diag = found.diagnostico || ''
                if (!pista) pista = found.pista || undefined
              }
            }
            return { letra, diagnostico: diag, pista }
          }

          return {
            id: r.id,
            lessonId: r.lesson_id || undefined,
            subjectSlug: r.materia === 'Matemáticas' ? 'matematicas' : 'fisica',
            enunciado: r.enunciado || '',
            opciones: [
              { letra: 'A', texto: r.opcion_a || '' },
              { letra: 'B', texto: r.opcion_b || '' },
              { letra: 'C', texto: r.opcion_c || '' },
              { letra: 'D', texto: r.opcion_d || '' },
            ],
            respuestaCorrecta: (r.respuesta_correcta || 'A') as OpcionLetter,
            explicacionCorrecta: r.explicacion_correcta || '',
            distractores: [
              getDistractorInfo('A'),
              getDistractorInfo('B'),
              getDistractorInfo('C'),
              getDistractorInfo('D'),
            ],
            nivel: (r.nivel || 'medio') as 'basico' | 'medio' | 'avanzado',
            topico: r.topico || r.materia || 'Física',
          }
        })

        setReactivos(mapped)
        setError(null)
      } catch (err) {
        setError('Error al conectar con InsForge para cargar los reactivos.')
      } finally {
        setLoading(false)
      }
    }

    loadReactivos()
  }, [])

  function handleNext() {
    if (currentIndex < reactivos.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Si llegó al final, reinicia al primer reactivo
      setCurrentIndex(0)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  function handleAnswer(correcto: boolean, opcion: string) {
    console.log(`[InsForge] Reactivo ${currentIndex + 1}/${reactivos.length} | Opción: ${opcion} | Correcto: ${correcto}`)
  }

  function handleOpenTutor(opcionIntentada: string, diagnostico: string) {
    alert(`🤖 Tutor IA Socrático (InsForge)\n\nHas marcado la opción ${opcionIntentada}.\n\nDiagnóstico registrado:\n"${diagnostico}"`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-cream-border shadow-sm">
        <Loader2 className="w-8 h-8 text-smart-blue animate-spin mx-auto" />
        <p className="text-stone-600 font-medium text-sm">Cargando reactivos desde la base de datos de InsForge...</p>
      </div>
    )
  }

  if (error || reactivos.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-red-200 shadow-sm">
        <p className="text-red-500 font-semibold">{error || 'No hay reactivos disponibles'}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reintentar Carga</span>
        </button>
      </div>
    )
  }

  const currentReactivo = reactivos[currentIndex]

  return (
    <div className="min-h-screen bg-cream-bg py-8 px-4">
      {/* Header del entrenador */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-smart-blue/10 text-smart-blue text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-2">
            <span>⚡</span>
            <span>InsForge DB · Reactivos en Vivo</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-smart-blue">
            Demo — ReactivoViewer con LaTeX
          </h1>
        </div>

        {/* Navegación rápida entre reactivos */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-cream-border shadow-sm">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent text-stone-600"
            title="Anterior reactivo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-stone-700 min-w-[60px] text-center font-mono">
            {currentIndex + 1} / {reactivos.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
            title="Siguiente reactivo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Visor interactivo del reactivo */}
      <ReactivoViewer
        key={currentReactivo.id}
        reactivo={currentReactivo}
        onAnswer={handleAnswer}
        onOpenTutor={handleOpenTutor}
        onNext={handleNext}
        numeroReactivo={currentIndex + 1}
        totalReactivos={reactivos.length}
      />
    </div>
  )
}
