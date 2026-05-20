import { useState, useMemo } from 'react'
import { useAnalysisStore, useUIStore } from '../../store'
import ConceptGrid from '../learn/ConceptGrid'
import type { Concept } from '../../types/report'

/* ── Quiz logic ─────────────────────────────────────────────────── */

interface Question {
  concept: Concept
  options: string[]
  correctIdx: number
}

function buildQuiz(concepts: Concept[]): Question[] {
  const definitions = concepts.map((c) => c.definition)
  return concepts.map((concept) => {
    const wrong = definitions
      .filter((d) => d !== concept.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const opts = [...wrong, concept.definition].sort(() => Math.random() - 0.5)
    return { concept, options: opts, correctIdx: opts.indexOf(concept.definition) }
  })
}

/* ── Component ───────────────────────────────────────────────────── */

export default function LearnPanel() {
  const { activeReport, activeSample } = useAnalysisStore()
  const { setActivePanel } = useUIStore()
  const [quizMode, setQuizMode] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [submitted, setSubmitted] = useState(false)

  const quiz = useMemo(
    () => (activeReport ? buildQuiz(activeReport.concepts) : []),
    [activeReport],
  )

  if (!activeReport) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
        <p className="text-sm">Generate an AI report to unlock course concepts.</p>
        <button
          onClick={() => setActivePanel('report')}
          className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go to Report
        </button>
      </div>
    )
  }

  function startQuiz() {
    setAnswers(new Array(quiz.length).fill(null))
    setSubmitted(false)
    setQuizMode(true)
  }

  function pick(qi: number, optIdx: number) {
    if (submitted) return
    setAnswers((prev) => prev.map((v, i) => (i === qi ? optIdx : v)))
  }

  function score() {
    return answers.filter((a, i) => a === quiz[i].correctIdx).length
  }

  /* ── Quiz view ─────────────────────────────────────────────────── */
  if (quizMode) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Concept Quiz</h2>
          <button
            onClick={() => setQuizMode(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Back to cards
          </button>
        </div>

        {submitted && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">
              {score()} / {quiz.length}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {score() === quiz.length ? 'Perfect score!' : 'Review the cards and try again.'}
            </p>
            <button
              onClick={startQuiz}
              className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {quiz.map((q, qi) => {
            const picked = answers[qi]
            return (
              <div key={qi} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <p className="mb-3 text-sm font-semibold text-zinc-200">
                  {qi + 1}. What is <span className="text-indigo-300">{q.concept.term}</span>?
                </p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oi) => {
                    let cls = 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                    if (submitted) {
                      if (oi === q.correctIdx) cls = 'border-green-600 bg-green-900/30 text-green-300'
                      else if (oi === picked) cls = 'border-red-600 bg-red-900/30 text-red-300'
                      else cls = 'border-zinc-800 bg-zinc-900 text-zinc-500 opacity-50'
                    } else if (picked === oi) {
                      cls = 'border-indigo-500 bg-indigo-900/30 text-indigo-200'
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => pick(qi, oi)}
                        className={`rounded border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answers.some((a) => a === null)}
            className="rounded bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
          >
            Submit Answers
          </button>
        )}
      </div>
    )
  }

  /* ── Cards view ────────────────────────────────────────────────── */
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Learn</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Key concepts from{' '}
            <span className="font-semibold text-zinc-200">{activeSample?.displayName ?? 'this trace'}</span>.
            Click any card to reveal the definition.
          </p>
        </div>
        {quiz.length >= 2 && (
          <button
            onClick={startQuiz}
            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Take Quiz
          </button>
        )}
      </div>

      <ConceptGrid concepts={activeReport.concepts} />
    </div>
  )
}
