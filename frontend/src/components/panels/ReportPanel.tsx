import { useEffect } from 'react'
import { useAnalysisStore } from '../../store'
import { useStreamingReport } from '../../hooks/useStreamingReport'
import VerdictBadge from '../report/VerdictBadge'
import ConfidenceRing from '../report/ConfidenceRing'
import NarrativeBlock from '../report/NarrativeBlock'
import MitreTable from '../report/MitreTable'
import RiskScoreBar from '../report/RiskScoreBar'
import ExportButton from '../common/ExportButton'

export default function ReportPanel() {
  const { activeReport, activeSample, activeTraceId, setActiveReport } = useAnalysisStore()
  const { report, isStreaming, error, streamText, startStreaming, reset } = useStreamingReport()

  useEffect(() => { if (report) setActiveReport(report) }, [report, setActiveReport])
  useEffect(() => { reset() }, [activeTraceId, reset])

  const displayReport = report ?? activeReport

  if (!displayReport && !isStreaming && !activeTraceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--fg-3)', fontSize: 14 }}>
          No traces yet. Load a sample to begin.
        </p>
      </div>
    )
  }

  if (!displayReport && !isStreaming && activeTraceId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-3)', fontStyle: 'italic' }}>
          Binary disassembled. Ready to generate AI analysis.
        </p>
        {error && <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--oxblood-300)', fontStyle: 'italic' }}>{error}</p>}
        <button className="btn btn-primary" onClick={() => startStreaming(activeTraceId)}>
          Generate report
        </button>
      </div>
    )
  }

  if (isStreaming && !displayReport) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-8">
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-3)' }}>
          ASMTrace is analyzing your binary…
        </p>
        {streamText && (
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', opacity: .5, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'var(--bg-raised)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', padding: 14 }}>
            {streamText}
          </pre>
        )}
      </div>
    )
  }

  return (
    <div id="print-report" className="flex flex-col gap-7 p-8 mx-auto w-full" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="no-print flex items-center justify-between">
        <p className="eyebrow">Analysis report</p>
        <div className="flex items-center gap-2">
          {activeTraceId && (
            <button className="btn btn-ghost btn-sm" onClick={() => startStreaming(activeTraceId)} disabled={isStreaming}>
              {isStreaming ? 'Regenerating…' : 'Regenerate'}
            </button>
          )}
          <ExportButton />
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--oxblood-300)', fontStyle: 'italic' }}>{error}</p>
      )}

      {/* Verdict row */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="eyebrow">Verdict</p>
          <VerdictBadge verdict={displayReport!.verdict} />
          {activeSample && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{activeSample.displayName}</span>
          )}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ConfidenceRing confidence={displayReport!.confidence} />
        </div>
      </div>

      {/* Narrative */}
      <div>
        <p className="eyebrow mb-3">Analysis narrative</p>
        <NarrativeBlock narrative={displayReport!.narrative} />
      </div>

      {/* Risk scores */}
      <div>
        <p className="eyebrow mb-4">Behavior risk scores</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayReport!.behaviors.map((b, i) => <RiskScoreBar key={i} behavior={b} />)}
        </div>
      </div>

      {/* MITRE */}
      <MitreTable behaviors={displayReport!.behaviors} />
    </div>
  )
}
