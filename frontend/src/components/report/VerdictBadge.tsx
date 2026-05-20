import type { Verdict } from '../../types/report'

const VERDICT_STYLE: Record<Verdict, { bg: string; text: string; ring: string; dot: string }> = {
  SAFE:       { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', ring: 'rgba(34,197,94,0.3)',  dot: '#22c55e' },
  SUSPICIOUS: { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', ring: 'rgba(245,158,11,0.3)', dot: '#f59e0b' },
  DANGEROUS:  { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', ring: 'rgba(239,68,68,0.3)',  dot: '#ef4444' },
}

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const s = VERDICT_STYLE[verdict]
  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-base font-bold tracking-widest"
      style={{
        background: s.bg,
        border: `1px solid ${s.ring}`,
        color: s.text,
        boxShadow: `0 0 16px ${s.bg}`,
      }}
    >
      <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: s.dot }} />
      {verdict}
    </span>
  )
}
