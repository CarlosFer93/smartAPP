'use client'

import ReactivoViewer from './ReactivoViewer'
import type { Reactivo } from '@/lib/types'

// ============================================================
// REACTIVO DE DEMO: Fórmula Cuadrática con LaTeX
// ============================================================

const reactivoDemo: Reactivo = {
  id: 'demo-mat-001',
  subjectSlug: 'matematicas',
  topico: 'Álgebra Cuadrática',
  nivel: 'medio',

  enunciado: `
Una empresa de ingeniería necesita determinar el tiempo (en segundos) que demora un proyectil en llegar al suelo.

La altura del proyectil en función del tiempo está modelada por la ecuación:

$$h(t) = -5t^2 + 20t + 25$$

¿En qué instante de tiempo $t$ (en segundos) el proyectil toca el suelo (es decir, cuando $h(t) = 0$)?

> Recuerda que la fórmula general para resolver una ecuación cuadrática $at^2 + bt + c = 0$ es:
> 
> $$t = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
`.trim(),

  opciones: [
    {
      letra: 'A',
      texto: '$t = 1$ segundo',
    },
    {
      letra: 'B',
      texto: '$t = 5$ segundos',
    },
    {
      letra: 'C',
      texto: '$t = -1$ segundo',
    },
    {
      letra: 'D',
      texto: '$t = 3$ segundos y $t = -1$ segundo',
    },
  ],

  respuestaCorrecta: 'B',

  explicacionCorrecta: `
**¡Correcto!** Aplicando la fórmula cuadrática con $a = -5$, $b = 20$, $c = 25$:

$$t = \\frac{-20 \\pm \\sqrt{(20)^2 - 4(-5)(25)}}{2(-5)}$$

$$t = \\frac{-20 \\pm \\sqrt{400 + 500}}{-10} = \\frac{-20 \\pm 30}{-10}$$

Las dos soluciones son:
- $t_1 = \\frac{-20 + 30}{-10} = \\frac{10}{-10} = -1$ (descartada: tiempo negativo)
- $t_2 = \\frac{-20 - 30}{-10} = \\frac{-50}{-10} = \\mathbf{5}$ ✅

**El proyectil toca el suelo en $t = 5$ segundos.** Los tiempos negativos no tienen significado físico en este contexto.
`.trim(),

  distractores: [
    {
      letra: 'A',
      diagnostico:
        't = 1 segundo es incorrecto. Si sustituyes t = 1 en h(t): h(1) = -5(1) + 20(1) + 25 = 40 ≠ 0. El proyectil aún está en el aire en ese instante.',
      pista:
        '¿Has intentado sustituir t = 1 directamente en la ecuación para verificar si da cero?',
    },
    {
      letra: 'C',
      diagnostico:
        't = -1 es una solución matemáticamente válida de la ecuación, pero en este contexto físico el tiempo no puede ser negativo. El proyectil fue lanzado en t = 0, no antes.',
      pista:
        'Matemáticamente t = -1 resuelve la ecuación, pero ¿tiene sentido físico un tiempo negativo en este problema?',
    },
    {
      letra: 'D',
      diagnostico:
        'Aunque encontraste correctamente ambas raíces de la ecuación cuadrática (t = 5 y t = -1), la respuesta debe ser solo t = 5 porque el tiempo negativo no tiene interpretación física válida en este contexto.',
      pista:
        'Tienes razón en que hay dos soluciones algebraicas, pero el problema pide el tiempo en que el proyectil TOCA el suelo. ¿Puedes descartar algún valor por contexto físico?',
    },
  ],
}

// ============================================================
// COMPONENTE: Página de demostración del ReactivoViewer
// ============================================================

export default function ReactivoDemo() {
  function handleAnswer(correcto: boolean, opcion: string) {
    console.log(`[Demo] Respuesta: ${opcion} | Correcto: ${correcto}`)
  }

  function handleOpenTutor(opcionIntentada: string, diagnostico: string) {
    alert(`🤖 Tutor IA Socrático\n\nHas marcado la opción ${opcionIntentada}.\n\nEl drawer del Tutor IA se abriría aquí con el diagnóstico:\n"${diagnostico}"`)
  }

  return (
    <div className="min-h-screen bg-cream-bg py-10 px-4">
      {/* Header de demo */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-smart-blue/10 text-smart-blue text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
          <span>📐</span>
          <span>Matemáticas · Álgebra Cuadrática</span>
        </div>
        <h1 className="text-2xl font-extrabold text-smart-blue">
          Demo — ReactivoViewer con LaTeX
        </h1>
        <p className="text-stone-500 text-sm mt-2">
          Renderizado con <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">react-markdown</code> + <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">remark-math</code> + <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">rehype-katex</code>
        </p>
      </div>

      {/* Componente real */}
      <ReactivoViewer
        reactivo={reactivoDemo}
        onAnswer={handleAnswer}
        onOpenTutor={handleOpenTutor}
        numeroReactivo={1}
        totalReactivos={5}
      />
    </div>
  )
}
