import type { BehaviorEntry } from '../../types/report'

function barGradient(score: number) {
  if (score >= 67) return 'linear-gradient(90deg, #dc2626, #ef4444)'
  if (score >= 34) return 'linear-gradient(90deg, #b45309, #f59e0b)'
  return 'linear-gradient(90deg, #15803d, #22c55e)'
}

function scoreColor(score: number) {
  if (score >= 67) return '#f87171'
  if (score >= 34) return '#fbbf24'
  return '#4ade80'
}

export default function RiskScoreBar({ behavior }: { behavior: BehaviorEntry }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-300">{behavior.name}</span>
        <span className="font-mono text-xs font-bold" style={{ color: scoreColor(behavior.risk_score) }}>
          {behavior.risk_score}/100
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${behavior.risk_score}%`, background: barGradient(behavior.risk_score) }}
        />
      </div>
    </div>
  )
}
