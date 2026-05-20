import { useAnalysisStore, useUIStore } from '../../store'
import BehaviorHeatmap from '../heatmap/BehaviorHeatmap'
import CategoryCard from '../heatmap/CategoryCard'
import SyscallList from '../heatmap/SyscallList'

export default function HeatmapPanel() {
  const { activeReport, activeTrace } = useAnalysisStore()
  const { setActivePanel } = useUIStore()

  if (!activeTrace) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            </svg>
          </div>
          <p className="text-sm text-zinc-500">Load a sample to view the behavior heatmap.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-8">
      <h2 className="text-lg font-bold text-zinc-100">Behavior Heatmap</h2>

      {activeReport ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Radar chart */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Risk Radar
            </p>
            <BehaviorHeatmap behaviors={activeReport.behaviors} />
          </div>

          {/* Category cards */}
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Behavior Breakdown
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeReport.behaviors.map((b, i) => (
                <CategoryCard key={i} behavior={b} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-between rounded-xl p-5"
          style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-subtle)' }}
        >
          <p className="text-sm text-zinc-500">
            Generate an AI report to see the risk radar and behavior breakdown.
          </p>
          <button
            onClick={() => setActivePanel('report')}
            className="btn-primary ml-4 shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium text-white"
          >
            Go to Report
          </button>
        </div>
      )}

      {/* Syscall log */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Syscall Sequence ({activeTrace.syscalls.length} calls)
        </p>
        <SyscallList syscalls={activeTrace.syscalls} />
      </div>
    </div>
  )
}
