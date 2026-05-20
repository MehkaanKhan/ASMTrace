import type { RegisterState } from '../../types/trace'

const REGISTERS: (keyof RegisterState)[] = [
  'rax', 'rbx', 'rcx', 'rdx',
  'rsi', 'rdi', 'rsp', 'rbp',
  'rip', 'rflags',
]

interface RegisterSidebarProps {
  registers: RegisterState | null
}

export default function RegisterSidebar({ registers }: RegisterSidebarProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col gap-0.5 border-l border-zinc-800 bg-zinc-900 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Registers
      </p>
      {registers
        ? REGISTERS.map((reg) => (
            <div key={reg} className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-asm-register">{reg}</span>
              <span className="text-zinc-300 truncate text-right">{registers[reg]}</span>
            </div>
          ))
        : REGISTERS.map((reg) => (
            <div key={reg} className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-asm-register">{reg}</span>
              <span className="text-zinc-700">—</span>
            </div>
          ))}
    </aside>
  )
}
