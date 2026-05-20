import type { BehaviorEntry } from '../../types/report'

interface CategoryCardProps {
  behavior: BehaviorEntry
}

function riskColor(score: number) {
  if (score <= 33) return 'border-green-700 bg-green-900/30 text-green-300'
  if (score <= 66) return 'border-amber-700 bg-amber-900/30 text-amber-300'
  return 'border-red-700 bg-red-900/30 text-red-300'
}

function riskBarColor(score: number) {
  if (score <= 33) return 'bg-green-500'
  if (score <= 66) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function CategoryCard({ behavior }: CategoryCardProps) {
  const color = riskColor(behavior.risk_score)
  const barColor = riskBarColor(behavior.risk_score)

  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold uppercase">{behavior.category}</span>
        <span className="font-mono text-sm font-bold">{behavior.risk_score}</span>
      </div>
      <p className="mt-1 text-xs font-semibold">{behavior.name}</p>
      <div className="mt-2 h-1.5 w-full rounded bg-zinc-800">
        <div
          className={`h-full rounded ${barColor}`}
          style={{ width: `${behavior.risk_score}%` }}
        />
      </div>
      {behavior.mitre_id && (
        <p className="mt-1 font-mono text-xs opacity-70">{behavior.mitre_id}</p>
      )}
    </div>
  )
}
