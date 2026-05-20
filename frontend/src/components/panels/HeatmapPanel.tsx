import { useAnalysisStore, useUIStore } from '../../store'
import BehaviorHeatmap from '../heatmap/BehaviorHeatmap'
import CategoryCard from '../heatmap/CategoryCard'
import SyscallList from '../heatmap/SyscallList'

export default function HeatmapPanel() {
  const { activeReport, activeTrace } = useAnalysisStore()
  const { setActivePanel } = useUIStore()

  if (!activeTrace) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Load a sample to view the behavior heatmap.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <h2 className="text-lg font-bold text-zinc-100">Behavior Heatmap</h2>

      {activeReport ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Radar chart */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Risk Radar
            </p>
            <BehaviorHeatmap behaviors={activeReport.behaviors} />
          </div>

          {/* Category cards */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
        <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">
            Generate an AI report to see the risk radar and behavior breakdown.
          </p>
          <button
            onClick={() => setActivePanel('report')}
            className="ml-4 shrink-0 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Go to Report
          </button>
        </div>
      )}

      {/* Syscall log — always visible once trace is loaded */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Syscall Sequence ({activeTrace.syscalls.length} calls)
        </p>
        <SyscallList syscalls={activeTrace.syscalls} />
      </div>
    </div>
  )
}
