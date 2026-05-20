import type { BehaviorEntry } from '../../types/report'

export default function MitreTable({ behaviors }: { behaviors: BehaviorEntry[] }) {
  const withMitre = behaviors.filter((b) => b.mitre_id)
  if (withMitre.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
      <div
        className="px-4 py-3"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          MITRE ATT&CK Mapping
        </p>
      </div>
      <table className="w-full font-mono text-xs" style={{ background: 'var(--bg-base)' }}>
        <thead>
          <tr className="text-left" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <th className="px-4 py-2.5 text-zinc-600 font-medium">Category</th>
            <th className="px-4 py-2.5 text-zinc-600 font-medium">Behavior</th>
            <th className="px-4 py-2.5 text-zinc-600 font-medium">Technique</th>
            <th className="px-4 py-2.5 text-right text-zinc-600 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {withMitre.map((b, i) => (
            <tr
              key={i}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <td className="px-4 py-2.5 text-zinc-500">{b.category}</td>
              <td className="px-4 py-2.5 text-zinc-300">{b.name}</td>
              <td className="px-4 py-2.5">
                <a
                  href={`https://attack.mitre.org/techniques/${b.mitre_id.replace('.', '/')}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  {b.mitre_id} — {b.mitre_name}
                </a>
              </td>
              <td className="px-4 py-2.5 text-right">
                <span
                  className="font-bold"
                  style={{
                    color: b.risk_score >= 67 ? '#f87171' : b.risk_score >= 34 ? '#fbbf24' : '#4ade80',
                  }}
                >
                  {b.risk_score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
