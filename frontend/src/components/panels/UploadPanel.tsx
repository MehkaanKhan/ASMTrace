import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useAnalysisStore, useUIStore } from '../../store'
import { SAMPLES, SAMPLE_IDS } from '../../data'
import { analyzeFile, fetchTrace } from '../../api/analysis'
import type { Verdict } from '../../types/report'

const VERDICT_CHIP: Record<Verdict, string> = {
  SAFE: 'chip chip-safe', SUSPICIOUS: 'chip chip-suspicious', DANGEROUS: 'chip chip-dangerous',
}

export default function UploadPanel() {
  const { setActiveSample, setActiveTrace } = useAnalysisStore()
  const { setActivePanel } = useUIStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleLoad(id: string) {
    const sample = SAMPLES[id]; if (!sample) return
    setActiveSample(sample); setActivePanel('trace')
  }

  async function handleFile(file: File) {
    setUploading(true); setUploadError(null)
    try {
      const { trace_id } = await analyzeFile(file)
      const trace = await fetchTrace(trace_id)
      setActiveTrace(trace, trace_id); setActivePanel('trace')
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-auto p-8">
      {/* Heading */}
      <div>
        <p className="eyebrow mb-2">Assembly analysis</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: 'var(--fg)', lineHeight: 1.2 }}>
          Select a program
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-3)', marginTop: 6, lineHeight: 1.55, fontStyle: 'italic' }}>
          Choose a preloaded sample to begin step-through analysis, or upload a compiled ELF binary.
        </p>
      </div>

      {/* Sample grid */}
      <section>
        <p className="eyebrow mb-4">Sample programs</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SAMPLE_IDS.map(id => {
            const s = SAMPLES[id]
            return (
              <div key={id} className="panel flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                    {s.displayName}
                  </span>
                  <span className={VERDICT_CHIP[s.riskLevel]}>{s.riskLevel.toLowerCase()}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5, flexGrow: 1 }}>
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {s.tags.map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)',
                      background: 'var(--bg-sunken)', border: '1px solid var(--hairline)',
                      borderRadius: 'var(--r-xs)', padding: '2px 6px',
                    }}>{tag}</span>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm w-full justify-center" onClick={() => handleLoad(id)}>
                  Load sample
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Upload zone */}
      <section>
        <p className="eyebrow mb-4">Upload binary</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
          onClick={() => !uploading && fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 p-12 text-center"
          style={{
            border: `1px dashed ${dragging ? 'var(--forest-700)' : 'var(--hairline)'}`,
            borderRadius: 'var(--r-md)',
            background: dragging ? 'rgba(45,74,62,.06)' : 'var(--bg-raised)',
            cursor: 'pointer',
            transition: `all var(--dur-base) var(--ease-standard)`,
          }}
        >
          {uploading ? (
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--fg-3)', fontSize: 14 }}>
              Disassembling binary…
            </p>
          ) : (
            <>
              <Upload size={24} strokeWidth={1.5} style={{ color: 'var(--fg-muted)' }} />
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-2)' }}>
                  Drop a compiled ELF x86-64 binary here
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
                  or click to browse — max 10 MB
                </p>
              </div>
              {uploadError && (
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--oxblood-300)', fontStyle: 'italic' }}>
                  {uploadError}
                </p>
              )}
            </>
          )}
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </section>
    </div>
  )
}
