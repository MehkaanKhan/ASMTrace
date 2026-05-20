import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import type { BehaviorEntry } from '../../types/report'

const LABELS: Record<string, string> = {
  filesystem: 'Filesystem', network: 'Network', memory: 'Memory',
  privilege: 'Privilege', process: 'Process', crypto: 'Crypto',
}

export default function BehaviorHeatmap({ behaviors }: { behaviors: BehaviorEntry[] }) {
  const scores: Record<string, number> = { filesystem:0, network:0, memory:0, privilege:0, process:0, crypto:0 }
  behaviors.forEach(b => { if (b.category in scores) scores[b.category] = Math.max(scores[b.category], b.risk_score) })

  const data = Object.entries(scores).map(([cat, score]) => ({
    subject: LABELS[cat] ?? cat, score, fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--hairline)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--fg-3)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
        <Radar name="Risk" dataKey="score" stroke="var(--ochre-500)" fill="var(--ochre-500)" fillOpacity={0.2} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--hairline)', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
          itemStyle={{ color: 'var(--ochre-300)' }}
          labelStyle={{ color: 'var(--fg-2)' }}
          formatter={(v: number) => [`${v}/100`, 'Risk score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
