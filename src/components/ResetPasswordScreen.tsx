import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FAVICON_URL } from '../lib/assetUrl'
import { inputClassName, buttonPrimaryClassName } from './forms/FormField'

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
            className={buttonPrimaryClassName}
          >
            {loading ? 'Please wait…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
