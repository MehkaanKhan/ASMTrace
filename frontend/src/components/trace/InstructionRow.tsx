import type { InstructionStep } from '../../types/trace'

interface Props { step: InstructionStep; isActive: boolean; onClick: () => void }

const MNEMONIC_COLOR: Record<string, string> = {
  data_move:    'var(--asm-register)',
  arithmetic:   'var(--asm-immediate)',
  control_flow: 'var(--asm-directive)',
  syscall:      'var(--asm-mnemonic)',
  memory:       'var(--asm-address)',
  crypto:       'var(--asm-label)',
}

export default function InstructionRow({ step, isActive, onClick }: Props) {
  const mnemonicColor = MNEMONIC_COLOR[step.category] ?? 'var(--fg-2)'

  return (
    <div
      onClick={onClick}
      className={`code-ln ${isActive ? 'current' : ''}`}
      style={{ cursor: 'pointer', borderLeft: isActive ? '2px solid var(--ochre-500)' : '2px solid transparent' }}
    >
      <span className="code-gutter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
        {isActive ? <span className="code-caret">▸</span> : step.index}
      </span>
      <span className="code-src" style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ color: 'var(--asm-address)', width: 90, flexShrink: 0, fontSize: 11 }}>{step.address}</span>
        <span style={{ color: mnemonicColor, fontWeight: 600, minWidth: 52 }}>{step.mnemonic}</span>
        {step.operands && (
          <span style={{ color: 'var(--fg-2)', marginLeft: 4 }}>{step.operands}</span>
        )}
        {step.isSyscall && step.syscallName && (
          <span style={{
            marginLeft: 12,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: 'var(--oxblood-300)',
            background: 'rgba(115,32,32,.25)',
            border: '1px solid var(--oxblood-700)',
            borderRadius: 'var(--r-pill)',
            padding: '1px 7px',
          }}>
            {step.syscallName}
          </span>
        )}
        {step.annotation && (
          <span style={{ color: 'var(--asm-comment)', marginLeft: 16, fontStyle: 'italic', fontSize: 11 }}>
            ; {step.annotation}
          </span>
        )}
      </span>
    </div>
  )
}
