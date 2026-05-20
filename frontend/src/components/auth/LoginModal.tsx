import { useState } from 'react'
import { loginUser, registerUser } from '../../api/auth'
import { useAuthStore } from '../../store'

interface Props {
  onClose: () => void
}

export default function LoginModal({ onClose }: Props) {
  const { setAuth } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isProfessor, setIsProfessor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res =
        mode === 'login'
          ? await loginUser(email, password)
          : await registerUser(email, password, displayName, isProfessor)
      setAuth(res.user, res.access_token)
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not reach the server. The backend is not deployed in this demo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-200">Account</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none">×</button>
        </div>

        {/* Tabs */}
        <div
          className="mb-5 flex gap-1 rounded-lg p-1"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 rounded py-1.5 text-xs font-semibold capitalize transition-colors"
              style={
                mode === m
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                  : { color: '#71717a', border: '1px solid transparent' }
              }
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
              className="rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            className="rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            className="rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          {mode === 'register' && (
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={isProfessor}
                onChange={(e) => setIsProfessor(e.target.checked)}
                className="accent-indigo-500"
              />
              Register as professor
            </label>
          )}

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
