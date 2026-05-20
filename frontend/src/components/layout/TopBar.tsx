import { useState } from 'react'
import { useAnalysisStore, useAuthStore } from '../../store'
import { SAMPLES, SAMPLE_IDS } from '../../data'
import LoginModal from '../auth/LoginModal'

export default function TopBar() {
  const { activeSample, setActiveSample } = useAnalysisStore()
  const { user, logout } = useAuthStore()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header
        id="topbar"
        className="flex h-12 shrink-0 items-center justify-between px-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span className="font-mono text-xs font-medium tracking-wide text-zinc-500">
          AI-Powered Assembly Behavior Analysis
        </span>

        <div className="flex items-center gap-3">
          <label htmlFor="sample-select" className="text-xs text-zinc-600">
            Sample:
          </label>
          <select
            id="sample-select"
            value={activeSample?.id ?? ''}
            onChange={(e) => {
              const sample = SAMPLES[e.target.value]
              if (sample) setActiveSample(sample)
            }}
            className="rounded-md px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <option value="">— select a sample —</option>
            {SAMPLE_IDS.map((id) => (
              <option key={id} value={id}>
                {SAMPLES[id].displayName}
              </option>
            ))}
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-300">
                  {user.display_name ?? user.email}
                </span>
                {user.is_professor && (
                  <span
                    className="ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-300"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    PROF
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="rounded-md px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="btn-primary rounded-md px-3 py-1 text-xs font-semibold text-white"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
