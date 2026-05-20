import type { InstructionStep, InstructionCategory } from '../../types/trace'
import SyscallBadge from './SyscallBadge'

interface InstructionRowProps {
  step: InstructionStep
  isActive: boolean
  onClick: () => void
}

const CATEGORY_COLOR: Record<InstructionCategory, string> = {
  data_move:    'text-blue-400',
  arithmetic:   'text-purple-400',
  control_flow: 'text-yellow-400',
  syscall:      'text-red-400',
  memory:       'text-orange-400',
  crypto:       'text-pink-400',
}

export default function InstructionRow({ step, isActive, onClick }: InstructionRowProps) {
  const mnemonicColor = CATEGORY_COLOR[step.category]

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-3 border-l-2 px-3 py-1.5 font-mono text-xs transition-colors ${
        isActive
          ? 'border-emerald-400 bg-zinc-700/80 text-zinc-100'
          : 'border-transparent hover:border-zinc-600 hover:bg-zinc-800/60 text-zinc-400'
      }`}
    >
      {/* Index */}
      <span className="w-8 shrink-0 text-right text-zinc-600">{step.index}</span>

      {/* Address */}
      <span className="w-24 shrink-0 text-asm-address">{step.address}</span>

      {/* Bytes */}
      <span className="w-28 shrink-0 text-zinc-600">{step.bytes}</span>

      {/* Mnemonic + operands */}
      <span className="flex-1">
        <span className={`font-bold ${mnemonicColor}`}>{step.mnemonic}</span>
        {step.operands && (
          <span className="ml-2 text-zinc-300">{step.operands}</span>
        )}
        {step.isSyscall && step.syscallName && (
          <SyscallBadge name={step.syscallName} />
        )}
      </span>
    </div>
  )
}
