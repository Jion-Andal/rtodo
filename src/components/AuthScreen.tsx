import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FAVICON_URL } from '../lib/assetUrl'
import { isSupabaseConfigured } from '../lib/supabase'

type AuthMode = 'signin' | 'signup' | 'forgot'

const inputClassName = 'field-input'

export function AuthScreen() {
  const { signIn, signUp, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isSupabaseConfigured) {
    return (
      <div className="app-shell flex min-h-full items-center justify-center px-4">
        <div className="panel w-full max-w-sm p-6 sm:max-w-md lg:p-8">
          <h1 className="text-lg font-semibold text-ink dark:text-zinc-100">
            Supabase setup required
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Add your publishable key to <code className="text-ink">.env.local</code> as{' '}
            <code className="text-ink">VITE_SUPABASE_PUBLISHABLE_KEY</code>, then restart the dev
            server.
          </p>
        </div>
      </div>
    )
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage('')
    setSuccessMessage('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccessMessage('')
    try {
      await signIn(username, password)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccessMessage('')
    try {
      await signUp({ email, username, password })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccessMessage('')
    try {
      await requestPasswordReset(username)
      setSuccessMessage(
        'If that username exists, a reset link has been sent to the associated email.',
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  const subtitle =
    mode === 'signin'
      ? 'Sign in with your username and password'
      : mode === 'signup'
        ? 'Create an account to get started'
        : 'Enter your username to receive a reset link'

  return (
    <div className="app-shell flex min-h-full items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-6 sm:max-w-md lg:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <img
            src={FAVICON_URL}
            alt=""
            className="h-9 w-9 rounded-md"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink dark:text-zinc-100">
              RTodo
            </h1>
            <p className="text-sm text-ink-muted">{subtitle}</p>
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="mb-4 flex rounded-md border border-border bg-surface-muted p-0.5 dark:border-dark-border dark:bg-dark-panel">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-surface text-ink shadow-sm dark:bg-dark-elevated dark:text-zinc-100'
                  : 'text-ink-muted hover:text-ink dark:text-zinc-500'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-surface text-ink shadow-sm dark:bg-dark-elevated dark:text-zinc-100'
                  : 'text-ink-muted hover:text-ink dark:text-zinc-500'
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        {mode === 'signin' && (
          <form className="space-y-4" onSubmit={handleSignIn}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClassName}
              />
            </label>
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Password</span>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-medium text-mint-600 hover:text-mint-500 dark:text-mint-400 dark:hover:text-mint-300"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClassName}
              />
            </label>
            {successMessage && (
              <p className="text-sm text-sage-500 dark:text-sage-300" role="status">
                {successMessage}
              </p>
            )}
            {message && (
              <p className="text-sm text-peach-400 dark:text-peach-300" role="alert">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait…' : 'Sign in'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form className="space-y-4" onSubmit={handleSignUp}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClassName}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClassName}
              />
              <span className="mt-1 block text-xs text-ink-muted">Used to sign in</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClassName}
              />
            </label>
            {message && (
              <p className="text-sm text-peach-400 dark:text-peach-300" role="alert">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait…' : 'Create account'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClassName}
              />
              <span className="mt-1 block text-xs text-ink-muted">
                We&apos;ll email a reset link to the address on your account
              </span>
            </label>
            {successMessage && (
              <p className="text-sm text-sage-500 dark:text-sage-300" role="status">
                {successMessage}
              </p>
            )}
            {message && (
              <p className="text-sm text-peach-400 dark:text-peach-300" role="alert">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait…' : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
