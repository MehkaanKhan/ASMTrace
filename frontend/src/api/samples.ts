import { apiClient } from './client'

export interface SampleMeta {
  id: string
  displayName: string
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS'
  description: string
  tags: string[]
}

export async function fetchSamples(): Promise<SampleMeta[]> {
  const { data } = await apiClient.get<SampleMeta[]>('/samples')
  return data
}
