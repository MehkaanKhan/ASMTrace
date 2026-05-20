import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { BehaviorEntry } from '../../types/report'

interface BehaviorHeatmapProps {
  behaviors: BehaviorEntry[]
}

const CATEGORY_LABELS: Record<string, string> = {
  filesystem: 'Filesystem',
  network:    'Network',
  memory:     'Memory',
  privilege:  'Privilege',
  process:    'Process',
  crypto:     'Crypto',
}

export default function BehaviorHeatmap({ behaviors }: BehaviorHeatmapProps) {
  const categoryScores: Record<string, number> = {
    filesystem: 0, network: 0, memory: 0,
    privilege: 0, process: 0, crypto: 0,
  }

  behaviors.forEach((b) => {
    if (b.category in categoryScores) {
      categoryScores[b.category] = Math.max(categoryScores[b.category], b.risk_score)
    }
  })

  const data = Object.entries(categoryScores).map(([cat, score]) => ({
    subject: CATEGORY_LABELS[cat] ?? cat,
    score,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#3f3f46" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
        />
        <Radar
          name="Risk Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.35}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 6 }}
          itemStyle={{ color: '#a5b4fc' }}
          labelStyle={{ color: '#e4e4e7' }}
          formatter={(value: number) => [`${value}/100`, 'Risk Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
