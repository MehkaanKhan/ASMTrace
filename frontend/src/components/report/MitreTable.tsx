import type { BehaviorEntry } from '../../types/report'

function scoreColor(s: number) {
  if (s >= 67) return 'var(--oxblood-300)'
  if (s >= 34) return 'var(--amber-300)'
  return 'var(--sage-300)'
}

export default function MitreTable({ behaviors }: { behaviors: BehaviorEntry[] }) {
  const rows = behaviors.filter(b => b.mitre_id)
  if (!rows.length) return null

  const cellStyle = { padding: '7px 14px', borderBottom: '1px solid var(--hairline)' }

  return (
    <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <div className="panel-head">
        <span className="panel-title">MITRE ATT&amp;CK mapping</span>
      </div>
      <table style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,.02)' }}>
            {['Category','Behavior','Technique','Risk'].map(h => (
              <th key={h} style={{ ...cellStyle, textAlign: h === 'Risk' ? 'right' : 'left', color: 'var(--fg-muted)', fontWeight: 600, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((b, i) => (
            <tr key={i}
              style={{ transition: 'background .1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.02)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <td style={{ ...cellStyle, color: 'var(--fg-3)' }}>{b.category}</td>
              <td style={{ ...cellStyle, color: 'var(--fg-2)' }}>{b.name}</td>
              <td style={cellStyle}>
                <a href={`https://attack.mitre.org/techniques/${b.mitre_id.replace('.','/')}/`}
                  target="_blank" rel="noreferrer"
                  style={{ color: 'var(--ochre-500)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.textDecoration = 'underline'}
                  onMouseLeave={e => (e.target as HTMLElement).style.textDecoration = 'none'}
                >
                  {b.mitre_id} — {b.mitre_name}
                </a>
              </td>
              <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: scoreColor(b.risk_score) }}>{b.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
