import { client } from './client'

export interface AnalysisSummary {
  id: number
  trace_id: string
  program_name: string
  verdict: string | null
  confidence: number | null
  created_at: string | null
}

export async function fetchDashboard(): Promise<AnalysisSummary[]> {
  const { data } = await client.get<AnalysisSummary[]>('/dashboard')
  return data
}
