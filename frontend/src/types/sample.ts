import type { TraceData } from './trace'
import type { AIReport, Verdict } from './report'

export interface SampleProgram {
  id: 'hello_world' | 'keylogger' | 'shellcode' | 'rootkit'
  displayName: string
  description: string
  architecture: 'x86_64'
  riskLevel: Verdict
  tags: string[]
  trace: TraceData
  report: AIReport
}
