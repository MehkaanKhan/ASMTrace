import { useRef, useState } from 'react'
import { useAnalysisStore, useUIStore } from '../../store'
import { SAMPLES, SAMPLE_IDS } from '../../data'
import { analyzeFile, fetchTrace } from '../../api/analysis'
import type { Verdict } from '../../types/report'

const VERDICT_GLOW: Record<Verdict, { border: string; glow: string; badge: string; dot: string }> = {
  SAFE:       { border: 'rgba(34,197,94,0.2)',  glow: '0 0 20px rgba(34,197,94,0.08)',   badge: 'rgba(34,197,94,0.15)',  dot: '#22c55e' },
  SUSPICIOUS: { border: 'rgba(245,158,11,0.2)', glow: '0 0 20px rgba(245,158,11,0.08)',  badge: 'rgba(245,158,11,0.15)', dot: '#f59e0b' },
  DANGEROUS:  { border: 'rgba(239,68,68,0.2)',  glow: '0 0 20px rgba(239,68,68,0.08)',   badge: 'rgba(239,68,68,0.15)',  dot: '#ef4444' },
}
const VERDICT_TEXT: Record<Verdict, string> = {
  SAFE: 'text-green-400', SUSPICIOUS: 'text-amber-400', DANGEROUS: 'text-red-400',
}

export default function UploadPanel() {
  const { setActiveSample, setActiveTrace } = useAnalysisStore()
  const { setActivePanel } = useUIStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleLoad(id: string) {
    const sample = SAMPLES[id]
    if (!sample) return
    setActiveSample(sample)
    setActivePanel('trace')
  }

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const { trace_id } = await analyzeFile(file)
      const trace = await fetchTrace(trace_id)
      setActiveTrace(trace, trace_id)
      setActivePanel('trace')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-auto p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Assembly Analysis</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Select a preloaded sample to begin step-through analysis, or upload your own binary.
        </p>
      </div>

      {/* Sample grid */}
      <section>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          Preloaded Samples
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SAMPLE_IDS.map((id) => {
            const s = SAMPLES[id]
            const v = VERDICT_GLOW[s.riskLevel]
            return (
              <div
                key={id}
                className="group flex flex-col gap-3 rounded-xl p-5 transition-all duration-200"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${v.border}`,
                  boxShadow: v.glow,
                }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-semibold text-zinc-200 leading-tight">
                    {s.displayName}
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${VERDICT_TEXT[s.riskLevel]}`}
                    style={{ background: v.badge }}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ backgroundColor: v.dot }} />
                    {s.riskLevel}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-1.5 py-0.5 text-[10px] text-zinc-500"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleLoad(id)}
                  className="btn-primary mt-auto w-full rounded-lg py-2 text-xs font-semibold text-white"
                >
                  Load Sample
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Upload zone */}
      <section>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          Upload Binary
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-4 rounded-xl p-12 text-center transition-all duration-200"
          style={{
            background: dragging ? 'rgba(79,70,229,0.05)' : 'var(--bg-elevated)',
            border: dragging
              ? '2px dashed rgba(99,102,241,0.5)'
              : '2px dashed var(--border-subtle)',
            boxShadow: dragging ? '0 0 30px rgba(79,70,229,0.1)' : 'none',
          }}
        >
          {uploading ? (
            <>
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-t-indigo-400"
                style={{ borderColor: 'var(--border-subtle)', borderTopColor: '#818cf8' }}
              />
              <p className="text-sm text-zinc-400">Disassembling binary…</p>
            </>
          ) : (
            <>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-zinc-300">Drop a compiled ELF x86-64 binary here</p>
                <p className="mt-1 text-xs text-zinc-600">or click to browse — max 10 MB</p>
              </div>
              {uploadError && (
                <p
                  className="rounded-lg px-4 py-2 text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {uploadError}
                </p>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-primary rounded-lg px-6 py-2 text-sm font-semibold text-white"
              >
                Choose File
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
