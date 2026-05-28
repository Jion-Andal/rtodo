import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Modal } from './Modal'
import { ConfirmModal } from './ConfirmModal'
import { WavingStickman } from './WavingStickman'
import { FormField, inputClassName, buttonPrimaryClassName } from './forms/FormField'
import { getErrorMessage } from '../utils/errorMessage'

const SPOTIFY_PLAYLIST_URL =
  'https://open.spotify.com/playlist/0d7vddP0pSlBcjZXDUnY5U?si=2a4b76bb8c644c06'
const DEVELOPER_GITHUB_URL = 'https://github.com/Jion-Andal'

interface SettingsScreenProps {
  onBack: () => void
}

interface SettingsRowProps {
  label: string
  description?: string
  onClick?: () => void
  href?: string
  destructive?: boolean
}

function SettingsRow({ label, description, onClick, href, destructive }: SettingsRowProps) {
  const className = `flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
    destructive
      ? 'border-peach-200 bg-peach-50 hover:bg-peach-100 dark:border-peach-400/30 dark:bg-peach-400/10 dark:hover:bg-peach-400/15'
      : 'border-border bg-surface hover:bg-surface-muted dark:border-dark-border dark:bg-dark-elevated dark:hover:bg-dark-panel'
  }`

  const content = (
    <>
      <div>
        <span
          className={`block text-sm font-medium ${
            destructive
              ? 'text-peach-400'
              : 'text-ink dark:text-zinc-100'
          }`}
        >
          {label}
        </span>
        {description && (
          <span
            className={`mt-0.5 block text-xs ${
              destructive
                ? 'text-ink-muted dark:text-peach-300/80'
                : 'text-ink-muted dark:text-zinc-400'
            }`}
          >
            {description}
          </span>
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={`h-5 w-5 shrink-0 ${
          destructive ? 'text-peach-500 dark:text-red-400' : 'text-ink-faint'
        }`}
      >
        {href ? (
          <path
            fillRule="evenodd"
            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { username, updateUsername, deleteAccount, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameSaving, setUsernameSaving] = useState(false)

  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const openUsernameModal = () => {
    setNewUsername(username ?? '')
    setUsernameError(null)
    setShowUsernameModal(true)
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError(null)
    setUsernameSaving(true)
    try {
      await updateUsername(newUsername)
      setShowUsernameModal(false)
    } catch (err) {
      setUsernameError(getErrorMessage(err, 'Could not update username.'))
    } finally {
      setUsernameSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    setDeleteError(null)
    setDeleting(true)
    void deleteAccount().catch((err) => {
      setDeleteError(getErrorMessage(err, 'Could not delete account.'))
      setDeleting(false)
    })
  }

  return (
    <div className="app-shell flex min-h-full flex-col">
      <header className="chrome">
        <div className="content-shell flex items-center gap-3 py-3 lg:py-3.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="btn-icon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 011.06 0l-4.25 4.25a.75.75 0 000 1.06l4.25 4.25a.75.75 0 11-1.06 1.06L7.22 10.5l3.5-3.5a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-ink dark:text-zinc-100">
            Settings
          </h1>
        </div>
      </header>

      <main className="main-content pb-24 lg:max-w-3xl lg:pb-28 xl:max-w-4xl">
        <div className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
          <SettingsRow
            label="Change Username"
            description={username ? `Current: ${username}` : undefined}
            onClick={openUsernameModal}
          />
          <SettingsRow
            label="Solid Soundtrip"
            description="Open playlist on Spotify"
            href={SPOTIFY_PLAYLIST_URL}
          />
          <SettingsRow
            label="About Developer"
            description="Contact and portfolio"
            onClick={() => setShowAboutModal(true)}
          />
        </div>

        <div className="mt-8 space-y-2 xl:col-span-2">
          <p className="mb-2 px-1 text-xs font-medium text-ink-faint dark:text-zinc-500">
            Account
          </p>
          <SettingsRow
            label="Delete Account"
            description="Permanently remove your account and personal data"
            onClick={() => setShowDeleteConfirm(true)}
            destructive
          />
          <SettingsRow
            label="Sign out"
            description="Sign out of RTodo on this device"
            onClick={() => setShowSignOutConfirm(true)}
          />
        </div>

        {deleteError && (
          <p className="mt-4 text-sm text-peach-400 dark:text-peach-300" role="alert">
            {deleteError}
          </p>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-10 lg:bottom-6">
        <div className="content-shell flex justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="btn-fab-secondary pointer-events-auto h-12 w-12"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          )}
        </button>
        </div>
      </div>

      <Modal
        open={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        title="Change username"
      >
        <form className="space-y-4" onSubmit={handleUsernameSubmit}>
          <FormField label="New username">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              autoComplete="username"
              className={inputClassName}
            />
          </FormField>
          {usernameError && (
            <p className="text-sm text-peach-400 dark:text-peach-300" role="alert">
              {usernameError}
            </p>
          )}
          <button
            type="submit"
            disabled={usernameSaving}
            className={buttonPrimaryClassName}
          >
            {usernameSaving ? 'Saving…' : 'Save username'}
          </button>
        </form>
      </Modal>

      <Modal
        open={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About Developer"
        decoration={<WavingStickman />}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-faint dark:text-zinc-500">
              Name
            </p>
            <p className="mt-1 text-base font-medium text-ink dark:text-zinc-100">
              Jion Andal
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-faint dark:text-zinc-500">
              Email
            </p>
            <a
              href="mailto:andaljion@gmail.com"
              className="mt-1 block text-base font-medium text-mint-600 hover:underline dark:text-mint-400"
            >
              andaljion@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-faint dark:text-zinc-500">
              GitHub
            </p>
            <a
              href={DEVELOPER_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-base font-medium text-mint-600 hover:underline dark:text-mint-400"
            >
              github.com/Jion-Andal
            </a>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete account?"
        message="This action is permanent. Your account, profile, and personal entries will be deleted. This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
        confirmDisabled={deleting}
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        open={showSignOutConfirm}
        title="Sign out?"
        message="Are you sure you want to sign out?"
        confirmLabel={signingOut ? 'Signing out…' : 'Sign out'}
        confirmDisabled={signingOut}
        onConfirm={() => {
          setSigningOut(true)
          void signOut().finally(() => {
            setSigningOut(false)
            setShowSignOutConfirm(false)
          })
        }}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </div>
  )
}
