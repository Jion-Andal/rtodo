import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FAVICON_URL } from '../lib/assetUrl'

const inputClassName =
  'w-full rounded-xl border border-border bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-mint-400 dark:border-border-strong dark:bg-[#1a2428] dark:text-mint-50 dark:focus:border-mint-500'

export function ResetPasswordScreen() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-mint-50 px-4 dark:bg-[#1e2830]">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm dark:border-border-strong dark:bg-[#243038]">
        <div className="mb-6 flex items-center gap-2.5">
          <img
            src={FAVICON_URL}
            alt=""
            className="h-10 w-10 rounded-lg shadow-sm"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-mint-600 dark:text-mint-300">
              Reset password
            </h1>
            <p className="text-sm text-ink-muted">Choose a new password for your account</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">New password</span>
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
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mint-600 disabled:opacity-60 dark:bg-mint-600 dark:hover:bg-mint-500"
          >
            {loading ? 'Please wait…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
