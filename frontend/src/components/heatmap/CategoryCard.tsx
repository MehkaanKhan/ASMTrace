import type { BehaviorEntry } from '../../types/report'

function riskChipClass(score: number) {
  if (score >= 67) return 'chip chip-dangerous'
  if (score >= 34) return 'chip chip-suspicious'
  return 'chip chip-safe'
}
function barColor(score: number) {
  if (score >= 67) return 'var(--oxblood-500)'
  if (score >= 34) return 'var(--amber-500)'
  return 'var(--sage-500)'
}

export default function CategoryCard({ behavior }: { behavior: BehaviorEntry }) {
  return (
    <div className="panel p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
          {behavior.category}
        </span>
        <span className={riskChipClass(behavior.risk_score)}>{behavior.risk_score}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.4 }}>{behavior.name}</p>
      <div style={{ height: 3, background: 'var(--bg-sunken)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${behavior.risk_score}%`, background: barColor(behavior.risk_score), borderRadius: 2 }} />
      </div>
      {behavior.mitre_id && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{behavior.mitre_id}</span>
      )}
    </div>
  )
}
