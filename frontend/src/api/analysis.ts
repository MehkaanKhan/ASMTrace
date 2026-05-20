import { apiClient } from './client'
import type { TraceData } from '../types/trace'

export interface AnalyzeResponse {
  trace_id: string
  total_instructions: number
}

export async function analyzeFile(file: File): Promise<AnalyzeResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<AnalyzeResponse>('/analyze', form)
  return data
}

export async function analyzeBySampleId(sampleId: string): Promise<AnalyzeResponse> {
  const form = new FormData()
  form.append('sample_id', sampleId)
  const { data } = await apiClient.post<AnalyzeResponse>('/analyze', form)
  return data
}

export async function fetchTrace(traceId: string): Promise<TraceData> {
  const { data } = await apiClient.get<TraceData>(`/analyze/${traceId}`)
  return data
}
