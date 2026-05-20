import type { SyscallEvent } from '../../types/trace'

export default function SyscallList({ syscalls }: { syscalls: SyscallEvent[] }) {
  const cellStyle = { padding: '6px 14px', borderBottom: '1px solid var(--hairline)' }
  return (
    <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <table style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,.02)' }}>
            {['Step','Syscall','Category','Return'].map(h => (
              <th key={h} style={{ ...cellStyle, textAlign: 'left', color: 'var(--fg-muted)', fontWeight: 600, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {syscalls.map((sc, i) => (
            <tr key={i}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.02)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <td style={{ ...cellStyle, color: 'var(--fg-muted)' }}>{sc.index}</td>
              <td style={{ ...cellStyle, fontWeight: 600, color: 'var(--oxblood-300)' }}>{sc.name}</td>
              <td style={{ ...cellStyle, color: 'var(--fg-3)' }}>{sc.category}</td>
              <td style={{ ...cellStyle, color: 'var(--fg-muted)' }}>{sc.returnValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
