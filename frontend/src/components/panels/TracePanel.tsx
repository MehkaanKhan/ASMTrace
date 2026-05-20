import { useRef, useEffect } from 'react'
import { useAnalysisStore } from '../../store'
import { useTracePlayback } from '../../hooks/useTracePlayback'
import StepControls from '../trace/StepControls'
import InstructionRow from '../trace/InstructionRow'
import RegisterSidebar from '../trace/RegisterSidebar'

export default function TracePanel() {
  useTracePlayback()

  const { activeTrace, currentStep, setCurrentStep } = useAnalysisStore()
  const activeRowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentStep])

  if (!activeTrace) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Load a sample from the Upload panel to begin.
      </div>
    )
  }

  const currentRegisters = activeTrace.steps[currentStep]?.registers ?? null

  return (
    <div className="flex h-full flex-col">
      <StepControls />

      <div className="flex flex-1 overflow-hidden">
        {/* Instruction list */}
        <div className="flex-1 overflow-y-auto">
          {/* Annotation bar */}
          <div className="border-b border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-400">
            {activeTrace.steps[currentStep]?.annotation || ' '}
          </div>

          {activeTrace.steps.map((step) => {
            const isActive = step.index === currentStep
            return (
              <div
                key={step.index}
                ref={isActive ? activeRowRef : null}
              >
                <InstructionRow
                  step={step}
                  isActive={isActive}
                  onClick={() => setCurrentStep(step.index)}
                />
              </div>
            )
          })}
        </div>

        <RegisterSidebar registers={currentRegisters} />
      </div>

      {/* Syscall log */}
      <div className="no-print shrink-0 border-t border-zinc-800 bg-zinc-900">
        <p className="border-b border-zinc-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Syscall Log ({activeTrace.syscalls.length})
        </p>
        <div className="flex gap-2 overflow-x-auto p-2">
          {activeTrace.syscalls.map((sc, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(sc.index)}
              className="flex shrink-0 flex-col items-start rounded border border-zinc-700 bg-zinc-800 p-2 text-left font-mono text-xs hover:border-red-600"
            >
              <span className="font-bold text-red-400">{sc.name}</span>
              <span className="text-zinc-500">#{sc.number} @ step {sc.index}</span>
              <span className="text-zinc-600 truncate max-w-[120px]">
                ret: {sc.returnValue}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
