import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ConfirmModal } from './ConfirmModal'
import { GroupSelector } from './GroupSelector'

interface HeaderProps {
  showCompleted?: boolean
}

export function Header({ showCompleted = false }: HeaderProps) {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur transition-colors duration-200 ${
        showCompleted
          ? 'border-border-strong bg-cream-dark/95 dark:border-lavender-500/20 dark:bg-[#1e2830]/95'
          : 'border-border bg-surface/95 dark:border-border-strong dark:bg-[#243038]/95'
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.svg"
            alt=""
            className="h-9 w-9 rounded-lg shadow-sm"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold tracking-tight text-mint-600 dark:text-mint-300">
            RTodo
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              showCompleted
                ? 'bg-lavender-200/60 text-ink hover:bg-lavender-300/60 dark:bg-lavender-500/20 dark:text-lavender-200 dark:hover:bg-lavender-500/30'
                : 'bg-mint-100 text-ink-muted hover:bg-mint-200 dark:bg-mint-600/20 dark:text-mint-200 dark:hover:bg-mint-600/30'
            }`}
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
          <GroupSelector showCompleted={showCompleted} />
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            aria-label="Sign out"
            className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showCompleted
                ? 'bg-lavender-200/60 text-ink hover:bg-lavender-300/60 dark:bg-lavender-500/20 dark:text-lavender-200 dark:hover:bg-lavender-500/30'
                : 'bg-mint-100 text-ink-muted hover:bg-mint-200 dark:bg-mint-600/20 dark:text-mint-200 dark:hover:bg-mint-600/30'
            }`}
          >
            Sign out
          </button>
        </div>
      </div>

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
    </header>
  )
}
