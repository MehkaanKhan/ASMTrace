import type { RegisterState } from '../../types/trace'

const REGISTERS: (keyof RegisterState)[] = ['rax','rbx','rcx','rdx','rsi','rdi','rsp','rbp','rip','rflags']

export default function RegisterSidebar({ registers }: { registers: RegisterState | null }) {
  return (
    <aside
      className="flex w-52 shrink-0 flex-col"
      style={{ background: 'var(--bg-raised)', borderLeft: '1px solid var(--hairline)' }}
    >
      <div className="panel-head">
        <span className="panel-title">Registers</span>
        <span className="panel-meta">x86_64</span>
      </div>
      <div className="flex flex-col gap-0 p-2 overflow-y-auto">
        {REGISTERS.map(reg => (
          <div
            key={reg}
            className="flex items-center justify-between gap-2 px-2 py-1"
            style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--asm-register)', minWidth: 44 }}>
              {reg}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: registers ? 'var(--fg-2)' : 'var(--ink-600)', textAlign: 'right' }}>
              {registers ? registers[reg] : '—'}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}
