export interface RegisterState {
  rax: string
  rbx: string
  rcx: string
  rdx: string
  rsi: string
  rdi: string
  rsp: string
  rbp: string
  rip: string
  rflags: string
}

export type InstructionCategory =
  | 'data_move'
  | 'arithmetic'
  | 'control_flow'
  | 'syscall'
  | 'memory'
  | 'crypto'

export type BehaviorCategory =
  | 'filesystem'
  | 'network'
  | 'memory'
  | 'privilege'
  | 'process'
  | 'crypto'

export interface MemoryAccess {
  address: string
  size: number
  type: 'read' | 'write'
  value?: string
}

export interface InstructionStep {
  index: number
  address: string
  bytes: string
  mnemonic: string
  operands: string
  category: InstructionCategory
  isSyscall: boolean
  syscallName?: string
  registers: RegisterState
  memoryAccess?: MemoryAccess
  annotation: string
}

export interface SyscallEvent {
  index: number
  name: string
  number: number
  args: string[]
  returnValue: string
  category: BehaviorCategory
}

export interface TraceData {
  programName: string
  architecture: 'x86_64'
  totalInstructions: number
  steps: InstructionStep[]
  syscalls: SyscallEvent[]
}
