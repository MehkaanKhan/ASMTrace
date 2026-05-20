import { lazy, Suspense } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useUIStore } from '../../store'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'

const UploadPanel     = lazy(() => import('../panels/UploadPanel'))
const TracePanel      = lazy(() => import('../panels/TracePanel'))
const HeatmapPanel    = lazy(() => import('../panels/HeatmapPanel'))
const ReportPanel     = lazy(() => import('../panels/ReportPanel'))
const LearnPanel      = lazy(() => import('../panels/LearnPanel'))
const DashboardPanel  = lazy(() => import('../panels/DashboardPanel'))

function PanelFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function AppShell() {
  const { activePanel } = useUIStore()

  return (
    <div className="flex h-screen flex-col overflow-hidden text-zinc-100" style={{backgroundColor:'var(--bg-base)'}}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<PanelFallback />}>
              {activePanel === 'upload'    && <UploadPanel />}
              {activePanel === 'trace'     && <TracePanel />}
              {activePanel === 'heatmap'   && <HeatmapPanel />}
              {activePanel === 'report'    && <ReportPanel />}
              {activePanel === 'learn'     && <LearnPanel />}
              {activePanel === 'dashboard' && <DashboardPanel />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
