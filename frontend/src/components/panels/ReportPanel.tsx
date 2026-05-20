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

  useEffect(() => {
    if (report) setActiveReport(report)
  }, [report, setActiveReport])

  useEffect(() => {
    reset()
  }, [activeTraceId, reset])

  const displayReport = report ?? activeReport

  if (!displayReport && !isStreaming && !activeTraceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="text-sm text-zinc-500">Load a sample to view the AI analysis report.</p>
        </div>
      </div>
    )
  }

  if (!displayReport && !isStreaming && activeTraceId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">Binary disassembled</p>
          <p className="mt-1 text-xs text-zinc-600">Ready to generate AI analysis</p>
        </div>
        {error && (
          <p
            className="rounded-lg px-4 py-2 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </p>
        )}
        <button
          onClick={() => startStreaming(activeTraceId)}
          className="btn-primary rounded-xl px-8 py-3 text-sm font-semibold text-white"
        >
          Generate AI Report
        </button>
      </div>
    )
  }

  if (isStreaming && !displayReport) {
    return (
      <div className="flex h-full flex-col gap-5 overflow-y-auto p-8">
        <div
          className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-400"
            style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#818cf8' }}
          />
          <span className="text-sm text-zinc-400">ASMTrace has got your back — analyzing your binary…</span>
        </div>
        {streamText && (
          <pre
            className="rounded-xl p-5 font-mono text-xs text-zinc-500 opacity-50 whitespace-pre-wrap break-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            {streamText}
          </pre>
        )}
      </div>
    )
  }

  return (
    <div id="print-report" className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="no-print flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-100">AI Analysis Report</h2>
        <div className="flex items-center gap-2">
          {activeTraceId && (
            <button
              onClick={() => startStreaming(activeTraceId)}
              disabled={isStreaming}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              {isStreaming ? 'Regenerating…' : 'Regenerate'}
            </button>
          )}
          <ExportButton />
        </div>
      </div>

      {error && (
        <p
          className="rounded-lg px-4 py-2 text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </p>
      )}

      {/* Verdict card */}
      <div
        className="flex items-center gap-6 rounded-xl p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Verdict</p>
          <VerdictBadge verdict={displayReport!.verdict} />
          {activeSample && (
            <p className="font-mono text-xs text-zinc-600">{activeSample.displayName}</p>
          )}
        </div>
        <div className="ml-auto">
          <ConfidenceRing confidence={displayReport!.confidence} />
        </div>
      </div>

      {/* Narrative */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Analysis Narrative
        </p>
        <NarrativeBlock narrative={displayReport!.narrative} />
      </div>

      {/* Risk scores */}
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Per-Behavior Risk Scores
        </p>
        <div className="flex flex-col gap-3">
          {displayReport!.behaviors.map((b, i) => (
            <RiskScoreBar key={i} behavior={b} />
          ))}
        </div>
      </div>

      {/* MITRE */}
      <MitreTable behaviors={displayReport!.behaviors} />
    </div>
  )
}
