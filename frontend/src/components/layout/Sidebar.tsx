import { useAuthStore, useUIStore, type PanelId } from '../../store'

const PANELS: { id: PanelId; label: string; icon: React.ReactNode }[] = [
  { id: 'upload',  label: 'Upload',  icon: <UploadIcon /> },
  { id: 'trace',   label: 'Trace',   icon: <TraceIcon /> },
  { id: 'heatmap', label: 'Heatmap', icon: <HeatmapIcon /> },
  { id: 'report',  label: 'Report',  icon: <ReportIcon /> },
  { id: 'learn',   label: 'Learn',   icon: <LearnIcon /> },
]

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}
function TraceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}
function HeatmapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
    </svg>
  )
}
function ReportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}
function LearnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

export default function Sidebar() {
  const { activePanel, setActivePanel } = useUIStore()
  const { user } = useAuthStore()

  const visible = user?.is_professor
    ? [...PANELS, { id: 'dashboard' as PanelId, label: 'Dashboard', icon: <DashboardIcon /> }]
    : PANELS

  return (
    <aside
      id="sidebar"
      className="flex w-[220px] shrink-0 flex-col py-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            A
          </div>
          <span className="gradient-text text-sm font-bold tracking-wide">ASMTrace</span>
        </div>
        <p className="mt-1.5 pl-9 text-[10px] uppercase tracking-widest text-zinc-600">
          v2.0
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {visible.map(({ id, label, icon }) => {
          const active = activePanel === id
          return (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.1))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      boxShadow: '0 0 12px rgba(99,102,241,0.1)',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.border = '1px solid var(--border-subtle)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.border = '1px solid transparent'
                }
              }}
            >
              <span className={active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'}>
                {icon}
              </span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
