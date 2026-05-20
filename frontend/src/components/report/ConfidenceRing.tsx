export default function ConfidenceRing({ confidence }: { confidence: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (confidence / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="66" height="66" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="33" cy="33" r={r} fill="none" stroke="var(--hairline)" strokeWidth="4" />
        <circle cx="33" cy="33" r={r} fill="none" stroke="var(--ochre-500)" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{confidence}%</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>confidence</span>
    </div>
  )
}
