import { create } from 'zustand'

export type PanelId = 'upload' | 'trace' | 'heatmap' | 'report' | 'learn' | 'dashboard'

interface UIState {
  activePanel: PanelId
  isLoading: boolean
  error: string | null
  setActivePanel: (panel: PanelId) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'upload',
  isLoading: false,
  error: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
