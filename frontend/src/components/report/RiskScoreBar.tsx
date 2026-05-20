import type { BehaviorEntry } from '../../types/report'

function barColor(score: number) {
  if (score >= 67) return 'var(--oxblood-500)'
  if (score >= 34) return 'var(--amber-500)'
  return 'var(--sage-500)'
}
function scoreColor(score: number) {
  if (score >= 67) return 'var(--oxblood-300)'
  if (score >= 34) return 'var(--amber-300)'
  return 'var(--sage-300)'
}

export default function RiskScoreBar({ behavior }: { behavior: BehaviorEntry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>{behavior.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: scoreColor(behavior.risk_score) }}>
          {behavior.risk_score}
        </span>
      </div>
      <div style={{ height: 3, background: 'var(--bg-sunken)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${behavior.risk_score}%`, background: barColor(behavior.risk_score), borderRadius: 2, transition: 'width .3s' }} />
      </div>
    </div>
  )
}
