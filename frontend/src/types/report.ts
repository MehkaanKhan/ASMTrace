import type { BehaviorCategory } from './trace'

export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS'

export interface BehaviorEntry {
  category: BehaviorCategory
  name: string
  description: string
  risk_score: number
  mitre_id: string
  mitre_name: string
  syscalls: string[]
}

export interface Concept {
  term: string
  definition: string
  course_topic: string
}

export interface AIReport {
  verdict: Verdict
  confidence: number
  narrative: string
  behaviors: BehaviorEntry[]
  concepts: Concept[]
}
