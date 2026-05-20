import type { Verdict } from '../../types/report'

const CHIP_CLASS: Record<Verdict, string> = {
  SAFE: 'chip chip-safe', SUSPICIOUS: 'chip chip-suspicious', DANGEROUS: 'chip chip-dangerous',
}

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={CHIP_CLASS[verdict]} style={{ fontSize: 12, padding: '5px 12px 5px 10px', letterSpacing: '.16em' }}>
      {verdict.toLowerCase()}
    </span>
  )
}
