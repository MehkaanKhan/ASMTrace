import { useAnalysisStore } from '../../store'

export default function StepControls() {
  const {
    currentStep,
    activeTrace,
    isPlaying,
    playbackSpeed,
    stepBack,
    stepForward,
    togglePlayback,
    reset,
    setPlaybackSpeed,
  } = useAnalysisStore()

  const total = activeTrace?.steps.length ?? 0

  return (
    <div
      id="step-controls"
      className="no-print flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2"
    >
      <button
        onClick={reset}
        title="Reset"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      >
        ⏮
      </button>
      <button
        onClick={stepBack}
        disabled={currentStep === 0}
        title="Step back"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
      >
        ◀
      </button>
      <button
        onClick={togglePlayback}
        title={isPlaying ? 'Pause' : 'Play'}
        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button
        onClick={stepForward}
        disabled={currentStep >= total - 1}
        title="Step forward"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
      >
        ▶
      </button>

      <span className="ml-2 font-mono text-xs text-zinc-500">
        {total > 0 ? `${currentStep + 1} / ${total}` : '—'}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <label htmlFor="speed-slider" className="text-xs text-zinc-500">
          Speed
        </label>
        <input
          id="speed-slider"
          type="range"
          min={100}
          max={2000}
          step={100}
          value={2100 - playbackSpeed}
          onChange={(e) => setPlaybackSpeed(2100 - Number(e.target.value))}
          className="w-24 accent-indigo-400"
          title={`${playbackSpeed}ms / step`}
        />
        <span className="w-16 text-right font-mono text-xs text-zinc-500">
          {playbackSpeed}ms
        </span>
      </div>
    </div>
  )
}
