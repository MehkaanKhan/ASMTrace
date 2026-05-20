import { useState } from 'react'
import { loginUser, registerUser } from '../../api/auth'
import { useAuthStore } from '../../store'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const { setAuth } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isProfessor, setIsProfessor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const res = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(email, password, displayName, isProfessor)
      setAuth(res.user, res.access_token); onClose()
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not reach the server. The backend is not deployed in this demo.'
      )
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)' }}>
      <div style={{ width: 360, background: 'var(--bg-raised)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-raised)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Account</p>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-sunken)', padding: 3, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)' }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '.04em', textTransform: 'capitalize',
              padding: '5px 0', borderRadius: 'var(--r-xs)',
              border: mode === m ? '1px solid var(--hairline)' : '1px solid transparent',
              background: mode === m ? 'var(--bg-raised)' : 'transparent',
              color: mode === m ? 'var(--fg)' : 'var(--fg-muted)',
              cursor: 'pointer', transition: 'all var(--dur-fast)',
            }}>{m}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && (
            <input className="inp" type="text" placeholder="Display name (optional)" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          )}
          <input className="inp" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
          <input className="inp" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          {mode === 'register' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-3)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isProfessor} onChange={e => setIsProfessor(e.target.checked)} style={{ accentColor: 'var(--forest-700)' }} />
              Register as professor
            </label>
          )}
          {error && (
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--oxblood-300)' }}>{error}</p>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4, opacity: loading ? .6 : 1 }}>
            {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
