import type { TraceData } from './trace'
import type { AIReport } from './report'

export interface AnalyzeRequest {
  sample_id?: string
  file?: File
}

export interface AnalyzeResponse {
  trace_id: string
  trace: TraceData
}

export interface ReportResponse {
  trace_id: string
  report: AIReport
}

export interface SampleMeta {
  id: string
  displayName: string
  description: string
  riskLevel: string
  tags: string[]
}

export interface ApiError {
  detail: string
  status: number
}
