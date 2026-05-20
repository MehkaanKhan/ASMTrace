import { useEffect, useState } from 'react'
import { fetchDashboard, type AnalysisSummary } from '../../api/dashboard'

const VERDICT_COLORS: Record<string, string> = {
  SAFE:       'text-green-400',
  SUSPICIOUS: 'text-amber-400',
  DANGEROUS:  'text-red-400',
}

export default function DashboardPanel() {
  const [rows, setRows] = useState<AnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
      .then(setRows)
      .catch((e) => setError(e?.response?.data?.detail ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-indigo-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400 text-sm">{error}</div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Professor Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-400">
          All student submissions — {rows.length} total
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No analyses yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                >
                  <td className="px-4 py-3 font-mono text-zinc-200">{row.program_name}</td>
                  <td className={`px-4 py-3 font-semibold ${VERDICT_COLORS[row.verdict ?? ''] ?? 'text-zinc-500'}`}>
                    {row.verdict ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {row.confidence != null ? `${row.confidence}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
