import { useEffect, useRef } from 'react'
import { useAnalysisStore } from '../store'

export function useTracePlayback() {
  const { isPlaying, playbackSpeed, stepForward } = useAnalysisStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(stepForward, playbackSpeed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, playbackSpeed, stepForward])
}
