import { SkipBack, ChevronLeft, Play, Pause, ChevronRight } from 'lucide-react'
import { useAnalysisStore } from '../../store'

export default function StepControls() {
  const { currentStep, activeTrace, isPlaying, playbackSpeed, stepBack, stepForward, togglePlayback, reset, setPlaybackSpeed } = useAnalysisStore()
  const total = activeTrace?.steps.length ?? 0

  return (
    <div
      id="step-controls"
      className="no-print flex items-center gap-2 px-4 py-2"
      style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--hairline)' }}
    >
      <button className="btn btn-ghost btn-sm" onClick={reset} title="Reset">
        <SkipBack size={13} strokeWidth={1.5} />
      </button>
      <button className="btn btn-ghost btn-sm" onClick={stepBack} disabled={currentStep === 0} title="Step back">
        <ChevronLeft size={13} strokeWidth={1.5} />
      </button>
      <button className="btn btn-primary btn-sm" onClick={togglePlayback} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={13} strokeWidth={1.5} /> : <Play size={13} strokeWidth={1.5} />}
        {isPlaying ? 'Pause' : 'Run'}
      </button>
      <button className="btn btn-ghost btn-sm" onClick={stepForward} disabled={currentStep >= total - 1} title="Step forward">
        <ChevronRight size={13} strokeWidth={1.5} />
      </button>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginLeft: 6 }}>
        {total > 0 ? `STEP ${currentStep + 1} / ${total}` : '—'}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Speed
        </span>
        <input
          type="range" min={100} max={2000} step={100}
          value={2100 - playbackSpeed}
          onChange={e => setPlaybackSpeed(2100 - Number(e.target.value))}
          style={{ width: 80, accentColor: 'var(--ochre-500)' }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', width: 48, textAlign: 'right' }}>
          {playbackSpeed}ms
        </span>
      </div>
    </div>
  )
}
