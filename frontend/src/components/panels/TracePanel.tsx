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
      <div className="flex h-full items-center justify-center">
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--fg-3)', fontSize: 14 }}>
          No traces yet. Load a sample to begin.
        </p>
      </div>
    )
  }

  const currentRegisters = activeTrace.steps[currentStep]?.registers ?? null

  return (
    <div className="flex h-full flex-col">
      <StepControls />

      {/* Annotation bar */}
      <div style={{ background: 'rgba(184,146,74,.07)', borderBottom: '1px solid var(--hairline)', padding: '5px 58px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ochre-300)', fontStyle: 'italic' }}>
          {activeTrace.steps[currentStep]?.annotation || ' '}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Code listing */}
        <div className="flex-1 overflow-y-auto">
          <pre className="code-pre">
            {activeTrace.steps.map(step => {
              const isActive = step.index === currentStep
              return (
                <div key={step.index} ref={isActive ? activeRowRef : null}>
                  <InstructionRow step={step} isActive={isActive} onClick={() => setCurrentStep(step.index)} />
                </div>
              )
            })}
          </pre>
        </div>

        <RegisterSidebar registers={currentRegisters} />
      </div>

      {/* Syscall strip */}
      <div className="no-print shrink-0" style={{ borderTop: '1px solid var(--hairline)', background: 'var(--bg-raised)' }}>
        <div className="panel-head">
          <span className="panel-title">Syscall log</span>
          <span className="panel-meta">{activeTrace.syscalls.length} calls</span>
        </div>
        <div className="flex gap-2 overflow-x-auto p-2">
          {activeTrace.syscalls.map((sc, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(sc.index)}
              className="flex shrink-0 flex-col items-start p-2 text-left"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'var(--bg-sunken)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-md)',
                transition: `border-color var(--dur-fast) var(--ease-standard)`,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--oxblood-700)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)'}
            >
              <span style={{ fontWeight: 600, color: 'var(--oxblood-300)' }}>{sc.name}</span>
              <span style={{ color: 'var(--fg-muted)', fontSize: 10 }}>step {sc.index}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
