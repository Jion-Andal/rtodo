import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { EntriesProvider } from './context/EntriesContext'
import { GroupsProvider, useGroups } from './context/GroupsContext'
import { JoinGroupInviteModal } from './components/JoinGroupInviteModal'
import { AuthScreen } from './components/AuthScreen'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CategoryView } from './components/CategoryView'
import { DueDateAlert } from './components/DueDateAlert'
import { useDueDateNotifications } from './hooks/useDueDateNotifications'
import type { Category } from './types'

function JoinGroupInviteGate() {
  const {
    pendingJoinCode,
    joining,
    joinError,
    confirmJoinInvite,
    dismissJoinInvite,
  } = useGroups()

  return (
    <JoinGroupInviteModal
      open={pendingJoinCode !== null}
      joining={joining}
      error={joinError}
      onConfirm={() => void confirmJoinInvite()}
      onCancel={dismissJoinInvite}
    />
  )
}

function AppContent() {
  const [activeCategory, setActiveCategory] = useState<Category>('checklist')
  const [showCompleted, setShowCompleted] = useState(false)
  const { inAppAlerts, dismissInAppAlerts } = useDueDateNotifications()

  return (
    <>
      <div
        className={`flex min-h-full flex-col transition-colors duration-200 ${
          showCompleted
            ? 'bg-cream-dark text-ink dark:bg-[#1a2428] dark:text-mint-50'
            : 'bg-mint-50 text-ink dark:bg-[#1e2830] dark:text-mint-50'
        }`}
      >
        <Header showCompleted={showCompleted} />

        <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4">
          <CategoryView
            category={activeCategory}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted((prev) => !prev)}
          />
        </main>

        <Footer
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showCompleted={showCompleted}
        />
      </div>

      <DueDateAlert entries={inAppAlerts} onDismiss={dismissInAppAlerts} />
      <JoinGroupInviteGate />
    </>
  )
}

function AuthenticatedApp() {
  const { session, loading, recoveryMode } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-mint-50 dark:bg-[#1e2830]">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    )
  }

  if (recoveryMode && session) {
    return <ResetPasswordScreen />
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <GroupsProvider>
      <EntriesProvider>
        <AppContent />
      </EntriesProvider>
    </GroupsProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
