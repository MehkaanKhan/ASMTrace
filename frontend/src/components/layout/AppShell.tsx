import { lazy, Suspense } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useUIStore } from '../../store'

const UploadPanel    = lazy(() => import('../panels/UploadPanel'))
const TracePanel     = lazy(() => import('../panels/TracePanel'))
const HeatmapPanel   = lazy(() => import('../panels/HeatmapPanel'))
const ReportPanel    = lazy(() => import('../panels/ReportPanel'))
const LearnPanel     = lazy(() => import('../panels/LearnPanel'))
const DashboardPanel = lazy(() => import('../panels/DashboardPanel'))

function Fallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
        Loading…
      </span>
    </div>
  )
}

export default function AppShell() {
  const { activePanel } = useUIStore()

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<Fallback />}>
            {activePanel === 'upload'    && <UploadPanel />}
            {activePanel === 'trace'     && <TracePanel />}
            {activePanel === 'heatmap'   && <HeatmapPanel />}
            {activePanel === 'report'    && <ReportPanel />}
            {activePanel === 'learn'     && <LearnPanel />}
            {activePanel === 'dashboard' && <DashboardPanel />}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
