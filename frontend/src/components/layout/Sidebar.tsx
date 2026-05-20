import { Upload, Code2, Hexagon, FileText, BookOpen, LayoutGrid } from 'lucide-react'
import { useAuthStore, useUIStore, type PanelId } from '../../store'

const PANELS = [
  { id: 'upload'  as PanelId, label: 'Upload',  Icon: Upload },
  { id: 'trace'   as PanelId, label: 'Trace',   Icon: Code2 },
  { id: 'heatmap' as PanelId, label: 'Heatmap', Icon: Hexagon },
  { id: 'report'  as PanelId, label: 'Report',  Icon: FileText },
  { id: 'learn'   as PanelId, label: 'Learn',   Icon: BookOpen },
]

export default function Sidebar() {
  const { activePanel, setActivePanel } = useUIStore()
  const { user } = useAuthStore()

  const visible = user?.is_professor
    ? [...PANELS, { id: 'dashboard' as PanelId, label: 'Dashboard', Icon: LayoutGrid }]
    : PANELS

  return (
    <aside
      id="sidebar"
      className="flex w-[200px] shrink-0 flex-col py-4"
      style={{ background: 'var(--bg-raised)', borderRight: '1px solid var(--hairline)' }}
    >
      {/* Wordmark */}
      <div className="px-4 pb-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <svg viewBox="0 0 200 40" aria-label="ASMTrace" style={{ width: 140, height: 'auto' }}>
          <g transform="translate(2 0)">
            <rect x=".5" y=".5" width="31" height="31" rx="3" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M 9 9 L 19 15.5 L 9 22 Z" fill="var(--forest-700)" />
            <line x1="4" y1="28" x2="28" y2="28" stroke="var(--ochre-500)" strokeWidth="1.25" />
          </g>
          <g transform="translate(42 0)" fill="currentColor">
            <text y="26" fontFamily="JetBrains Mono, monospace" fontSize="22" fontWeight="600">ASM</text>
            <text x="60" y="26" fontFamily="Source Serif 4, serif" fontSize="22" fontStyle="italic" fontWeight="500">Trace</text>
          </g>
        </svg>
      </div>

      {/* Nav */}
      <nav className="mt-3 flex flex-col gap-0.5 px-2">
        {visible.map(({ id, label, Icon }) => {
          const active = activePanel === id
          return (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className="flex items-center gap-2.5 rounded px-3 py-2 text-left transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                borderRadius: 'var(--r-md)',
                color: active ? 'var(--fg)' : 'var(--fg-3)',
                background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                borderLeft: active ? '2px solid var(--ochre-500)' : '2px solid transparent',
                transition: `all var(--dur-fast) var(--ease-standard)`,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--fg-3)' }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
