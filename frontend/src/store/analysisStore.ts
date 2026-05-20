import { create } from 'zustand'
import type { SampleProgram } from '../types/sample'
import type { TraceData } from '../types/trace'
import type { AIReport } from '../types/report'

interface AnalysisState {
  activeSample: SampleProgram | null
  activeTrace: TraceData | null
  activeReport: AIReport | null
  activeTraceId: string | null
  currentStep: number
  isPlaying: boolean
  playbackSpeed: number
  setActiveSample: (sample: SampleProgram) => void
  setActiveTrace: (trace: TraceData, traceId?: string) => void
  setActiveReport: (report: AIReport) => void
  setCurrentStep: (n: number) => void
  stepForward: () => void
  stepBack: () => void
  togglePlayback: () => void
  setPlaybackSpeed: (ms: number) => void
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  activeSample: null,
  activeTrace: null,
  activeReport: null,
  activeTraceId: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 600,

  setActiveSample: (sample) =>
    set({
      activeSample: sample,
      activeTrace: sample.trace,
      activeReport: sample.report,
      activeTraceId: null,
      currentStep: 0,
      isPlaying: false,
    }),

  setActiveTrace: (trace, traceId) =>
    set({
      activeSample: null,
      activeTrace: trace,
      activeReport: null,
      activeTraceId: traceId ?? null,
      currentStep: 0,
      isPlaying: false,
    }),

  setActiveReport: (report) => set({ activeReport: report }),

  setCurrentStep: (n) => {
    const trace = get().activeTrace
    if (!trace) return
    set({ currentStep: Math.max(0, Math.min(n, trace.steps.length - 1)) })
  },

  stepForward: () => {
    const { currentStep, activeTrace } = get()
    if (!activeTrace) return
    const next = currentStep + 1
    if (next < activeTrace.steps.length) {
      set({ currentStep: next })
    } else {
      set({ isPlaying: false })
    }
  },

  stepBack: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },

  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setPlaybackSpeed: (ms) => set({ playbackSpeed: ms }),

  reset: () => set({ currentStep: 0, isPlaying: false }),
}))
