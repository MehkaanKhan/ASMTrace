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
        className="flex h-11 shrink-0 items-center justify-between px-5"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--hairline)' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '.06em' }}>
          Assembly behavior analysis
        </span>

        <div className="flex items-center gap-3">
          <label
            htmlFor="sample-select"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}
          >
            Sample
          </label>
          <select
            id="sample-select"
            value={activeSample?.id ?? ''}
            onChange={e => { const s = SAMPLES[e.target.value]; if (s) setActiveSample(s) }}
            className="inp"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            <option value="">— select —</option>
            {SAMPLE_IDS.map(id => (
              <option key={id} value={id}>{SAMPLES[id].displayName}</option>
            ))}
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                {user.display_name ?? user.email}
                {user.is_professor && (
                  <span
                    className="ml-1.5"
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                      letterSpacing: '.14em', textTransform: 'uppercase',
                      color: 'var(--ochre-300)',
                      background: 'rgba(184,146,74,.12)',
                      border: '1px solid rgba(184,146,74,.3)',
                      borderRadius: 'var(--r-sm)',
                      padding: '2px 5px',
                    }}
                  >
                    Prof
                  </span>
                )}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowLogin(true)}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
