import { useState, useCallback, useRef } from 'react'
import type { AIReport } from '../types/report'

interface StreamingState {
  report: AIReport | null
  isStreaming: boolean
  error: string | null
  streamText: string
}

const INITIAL: StreamingState = {
  report: null,
  isStreaming: false,
  error: null,
  streamText: '',
}

export function useStreamingReport() {
  const [state, setState] = useState<StreamingState>(INITIAL)
  const abortRef = useRef<AbortController | null>(null)

  const startStreaming = useCallback(async (traceId: string) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setState({ ...INITIAL, isStreaming: true })

    let accumulated = ''

    try {
      const res = await fetch(`/api/report/${traceId}`, {
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const msg = res.status === 404
          ? 'Session expired — please re-upload your binary and try again.'
          : `Request failed: HTTP ${res.status}`
        setState({ ...INITIAL, error: msg })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)

          if (payload === '[DONE]') {
            try {
              const parsed = JSON.parse(accumulated) as AIReport
              setState({ report: parsed, isStreaming: false, error: null, streamText: accumulated })
            } catch {
              setState({ ...INITIAL, error: 'Could not parse report JSON from Claude' })
            }
            return
          }

          if (payload.startsWith('[ERROR]')) {
            setState({ ...INITIAL, error: payload.slice(8).trim() })
            return
          }

          // Backend escapes newlines as \n inside the SSE data field
          accumulated += payload.replace(/\\n/g, '\n')
          setState((prev) => ({ ...prev, streamText: accumulated }))
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      setState({ ...INITIAL, error: String(err) })
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(INITIAL)
  }, [])

  return { ...state, startStreaming, reset }
}
