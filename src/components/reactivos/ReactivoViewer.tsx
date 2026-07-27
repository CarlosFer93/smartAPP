'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { CheckCircle, XCircle, BrainCircuit, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react'
import type { Reactivo, OpcionLetter, DistractorFeedback } from '@/lib/types'

// ============================================================
// TIPOS LOCALES
// ============================================================

type OpcionEstado = 'idle' | 'selected' | 'correct' | 'wrong'

interface ReactivoViewerProps {
  reactivo: Reactivo
  /** Callback cuando el alumno responde (para registrar en InsForge) */
  onAnswer?: (correcto: boolean, opcion: OpcionLetter) => void
  /** Abre el drawer del Tutor IA Socrático con el contexto */
  onOpenTutor?: (opcionIntentada: OpcionLetter, diagnostico: string) => void
  /** Callback para avanzar al siguiente reactivo */
  onNext?: () => void
  /** Número del reactivo en la sesión (ej: "1 de 5") */
  numeroReactivo?: number
  totalReactivos?: number
}

// ============================================================
// AUTO-FORMATO DE LATEX
// ============================================================

export function autoFormatLatex(text: string): string {
  if (!text) return ''

  let formatted = text

  // 1. Reemplazar expresiones entre paréntesis con comandos LaTeX como (\to \theta) -> ($\to \theta$)
  formatted = formatted.replace(/\((\\to\s*\\[a-zA-Z]+|\\[a-zA-Z]+[^\)]*)\)/g, '($$$1$$)')

  // 2. Reemplazar grados como 30^{\circ} o 60^{\circ} por $30^{\circ}$ si no tienen $
  formatted = formatted.replace(/(?<!\$)\b(\d+)\s*\^{\s*\\circ\s*}(?!\$)/g, '$$$1^{\\circ}$$')
  formatted = formatted.replace(/(?<!\$)\b(\d+)\s*\\circ(?!\$)/g, '$$$1^{\\circ}$$')

  // 3. Reemplazar símbolos LaTeX sueltos como \theta, \mu_s, \tan, \Sigma sin $
  formatted = formatted.replace(/(?<!\$)\\(theta|alpha|beta|gamma|delta|pi|sigma|Sigma|omega|mu|lambda|to|approx|cdot|frac|sqrt|tan|sin|cos)(?=[^a-zA-Z]|$)(?!\$)/g, (match) => `\$${match}\$`)

  // 4. Limpiar cualquier triple $$$ duplicado
  formatted = formatted.replace(/\$\$\$+/g, '$')

  return formatted
}

// ============================================================
// COMPONENTE: Renderizador de texto con LaTeX
// ============================================================

function TextoLatex({ children }: { children: string }) {
  const content = autoFormatLatex(children)
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <span>{children}</span>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL: ReactivoViewer
// ============================================================

export default function ReactivoViewer({
  reactivo,
  onAnswer,
  onOpenTutor,
  onNext,
  numeroReactivo = 1,
  totalReactivos = 1,
}: ReactivoViewerProps) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionLetter | null>(null)
  const [respondido, setRespondido] = useState(false)
  const [mostrarFeedback, setMostrarFeedback] = useState(false)

  const esCorrecta = opcionSeleccionada === reactivo.respuestaCorrecta

  function getDistractor(letra: OpcionLetter): DistractorFeedback | undefined {
    return reactivo.distractores.find(d => d.letra === letra)
  }

  function getEstadoOpcion(letra: OpcionLetter): OpcionEstado {
    if (!respondido) {
      return opcionSeleccionada === letra ? 'selected' : 'idle'
    }
    if (letra === reactivo.respuestaCorrecta) return 'correct'
    if (letra === opcionSeleccionada && !esCorrecta) return 'wrong'
    return 'idle'
  }

  function handleSelectOpcion(letra: OpcionLetter) {
    if (respondido) return
    setOpcionSeleccionada(letra)
  }

  function handleConfirmar() {
    if (!opcionSeleccionada || respondido) return
    setRespondido(true)
    // Pequeño delay para animar la transición
    setTimeout(() => setMostrarFeedback(true), 200)
    onAnswer?.(opcionSeleccionada === reactivo.respuestaCorrecta, opcionSeleccionada)
  }

  function handleReintentar() {
    setOpcionSeleccionada(null)
    setRespondido(false)
    setMostrarFeedback(false)
  }

  function handleAbrirTutor() {
    if (!opcionSeleccionada) return
    const distractor = getDistractor(opcionSeleccionada)
    onOpenTutor?.(
      opcionSeleccionada,
      distractor?.diagnostico || 'Revisemos tu razonamiento juntos.'
    )
  }

  // ---- Estilos por estado de opción ----
  const opcionClasses: Record<OpcionEstado, string> = {
    idle:     'border-cream-border bg-white hover:border-smart-blue/40 hover:bg-blue-50/30 cursor-pointer',
    selected: 'border-smart-blue bg-smart-blue/5 cursor-pointer ring-2 ring-smart-blue/20',
    correct:  'border-smart-green bg-smart-greenLight/50 cursor-default',
    wrong:    'border-red-400 bg-red-50 cursor-default',
  }

  const letraClasses: Record<OpcionEstado, string> = {
    idle:     'bg-stone-100 text-stone-600 group-hover:bg-smart-blue/10 group-hover:text-smart-blue',
    selected: 'bg-smart-blue text-white',
    correct:  'bg-smart-green text-white',
    wrong:    'bg-red-500 text-white',
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 animate-fade-in">

      {/* Header del reactivo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Reactivo
          </span>
          <span className="bg-smart-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {numeroReactivo} / {totalReactivos}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-info capitalize">{reactivo.topico}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
            reactivo.nivel === 'basico'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            reactivo.nivel === 'medio'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-red-50 text-red-700 border-red-200'
          }`}>
            {reactivo.nivel === 'basico' ? '⭐ Básico' : reactivo.nivel === 'medio' ? '⭐⭐ Medio' : '⭐⭐⭐ Avanzado'}
          </span>
        </div>
      </div>

      {/* Tarjeta del enunciado */}
      <div className="bg-white rounded-2xl border border-cream-border shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
          <span>Enunciado</span>
        </div>
        <div className="text-stone-800 leading-relaxed text-base prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {autoFormatLatex(reactivo.enunciado)}
          </ReactMarkdown>
        </div>
      </div>

      {/* Opciones A, B, C, D */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Selecciona una opción:
        </p>

        {reactivo.opciones.map((opcion) => {
          const estado = getEstadoOpcion(opcion.letra)

          return (
            <button
              key={opcion.letra}
              onClick={() => handleSelectOpcion(opcion.letra)}
              disabled={respondido}
              className={`group w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${opcionClasses[estado]}`}
            >
              {/* Badge de letra */}
              <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 ${letraClasses[estado]}`}>
                {opcion.letra}
              </span>

              {/* Texto de la opción con LaTeX */}
              <span className="flex-1 text-stone-700 text-sm leading-relaxed pt-0.5">
                <TextoLatex>{opcion.texto}</TextoLatex>
              </span>

              {/* Íconos de estado (después de responder) */}
              {respondido && estado === 'correct' && (
                <CheckCircle className="shrink-0 w-5 h-5 text-smart-green mt-0.5" />
              )}
              {respondido && estado === 'wrong' && (
                <XCircle className="shrink-0 w-5 h-5 text-red-500 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Botón Confirmar (antes de responder) */}
      {!respondido && (
        <button
          onClick={handleConfirmar}
          disabled={!opcionSeleccionada}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            opcionSeleccionada
              ? 'bg-smart-blue hover:bg-smart-blueDark text-white shadow-smart'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>Confirmar Respuesta</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* ============================================================
          TARJETA DE RETROALIMENTACIÓN DIAGNÓSTICA
          ============================================================ */}
      {mostrarFeedback && opcionSeleccionada && (
        <div className={`rounded-2xl border-2 p-5 space-y-4 animate-slide-up ${
          esCorrecta
            ? 'border-smart-green/40 bg-smart-greenLight/30'
            : 'border-red-300/60 bg-red-50/50'
        }`}>

          {/* Header del feedback */}
          <div className="flex items-start gap-3">
            {esCorrecta ? (
              <div className="w-10 h-10 rounded-xl bg-smart-green flex items-center justify-center shrink-0 shadow">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className={`font-extrabold text-base ${esCorrecta ? 'text-smart-green' : 'text-red-600'}`}>
                {esCorrecta ? '¡Respuesta Correcta!' : `Respuesta Incorrecta — Opción ${opcionSeleccionada}`}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {esCorrecta
                  ? 'Excelente razonamiento. Aquí te explicamos el concepto completo:'
                  : `Has marcado la opción ${opcionSeleccionada}. Aquí está el diagnóstico de tu error:`
                }
              </p>
            </div>
          </div>

          {/* Contenido del diagnóstico */}
          <div className="bg-white/80 rounded-xl p-4 border border-white shadow-sm">
            {esCorrecta ? (
              // Explicación de la respuesta correcta
              <div className="text-sm text-stone-700 leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {autoFormatLatex(reactivo.explicacionCorrecta)}
                </ReactMarkdown>
              </div>
            ) : (
              // Diagnóstico del distractor
              <div className="space-y-3">
                <div className="text-sm text-stone-700 leading-relaxed">
                  <span className="font-bold text-red-600">Diagnóstico:</span>{' '}
                  {getDistractor(opcionSeleccionada)?.diagnostico ||
                    'Revisa el concepto asociado a esta pregunta.'}
                </div>
                {/* Respuesta correcta indicada */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <span className="w-6 h-6 rounded-md bg-smart-green flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {reactivo.respuestaCorrecta}
                  </span>
                  <span className="text-xs text-stone-600">
                    La respuesta correcta es la opción <strong className="text-smart-green">{reactivo.respuestaCorrecta}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Acciones post-feedback */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón Tutor IA (solo si falló) */}
            {!esCorrecta && (
              <button
                onClick={handleAbrirTutor}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-smart-blue text-white font-bold text-sm hover:bg-smart-blueDark transition-all duration-200 shadow-smart"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Pedir ayuda al Tutor IA</span>
              </button>
            )}
            {/* Botón siguiente / reintentar */}
            <button
              onClick={() => {
                if (esCorrecta) {
                  setOpcionSeleccionada(null)
                  setRespondido(false)
                  setMostrarFeedback(false)
                  onNext?.()
                } else {
                  handleReintentar()
                }
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                esCorrecta
                  ? 'flex-1 bg-smart-green hover:bg-smart-greenHover text-white shadow-green'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {esCorrecta ? (
                <>
                  <span>Siguiente Reactivo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Intentar de Nuevo</span>
                </>
              )}
            </button>
          </div>

          {/* Pista de aprendizaje */}
          {!esCorrecta && getDistractor(opcionSeleccionada)?.pista && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>Pista:</strong> {getDistractor(opcionSeleccionada)?.pista}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
