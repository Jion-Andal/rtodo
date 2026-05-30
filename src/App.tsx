import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { EntriesProvider } from './context/EntriesContext'
import { GroupsProvider, useGroups } from './context/GroupsContext'
import { JoinGroupInviteModal } from './components/JoinGroupInviteModal'
import { AuthScreen } from './components/AuthScreen'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DesktopSidebar } from './components/DesktopSidebar'
import { CategoryView } from './components/CategoryView'
import { DueDateAlert } from './components/DueDateAlert'
import { RemoteChangesBanner } from './components/RemoteChangesBanner'
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

const SIDEBAR_COLLAPSED_KEY = 'rtodo-sidebar-collapsed'

function AppContent({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [activeCategory, setActiveCategory] = useState<Category>('checklist')
  const [showCompleted, setShowCompleted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showEventCalendar, setShowEventCalendar] = useState(false)
  const [showExpenseCalculations, setShowExpenseCalculations] = useState(false)
  const { inAppAlerts, dismissInAppAlerts } = useDueDateNotifications()

  useEffect(() => {
    if (activeCategory !== 'events') {
      setShowEventCalendar(false)
    }
    if (activeCategory !== 'expenses') {
      setShowExpenseCalculations(false)
    }
  }, [activeCategory])

  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true') {
      setSidebarCollapsed(true)
    }
  }, [])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  return (
    <>
      <div
        className={`flex min-h-full ${showCompleted ? 'app-shell-completed' : 'app-shell'}`}
      >
        <DesktopSidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
          showCompleted={showCompleted}
          onViewEventCalendar={() => setShowEventCalendar(true)}
          eventCalendarOpen={showEventCalendar}
          onViewExpenseCalculations={() => setShowExpenseCalculations(true)}
          expenseCalculationsOpen={showExpenseCalculations}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header showCompleted={showCompleted} onOpenSettings={onOpenSettings} />
          <RemoteChangesBanner />

          <main className="main-content">
            <CategoryView
              category={activeCategory}
              showCompleted={showCompleted}
              onToggleCompleted={() => setShowCompleted((prev) => !prev)}
              showCalendarModal={showEventCalendar}
              onShowCalendarModalChange={setShowEventCalendar}
              showExpenseCalculationsModal={showExpenseCalculations}
              onShowExpenseCalculationsModalChange={setShowExpenseCalculations}
            />
          </main>

          <Footer
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            showCompleted={showCompleted}
          />
        </div>
      </div>

      <DueDateAlert entries={inAppAlerts} onDismiss={dismissInAppAlerts} />
      <JoinGroupInviteGate />
    </>
  )
}

function AuthenticatedApp() {
  const { session, loading, recoveryMode } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  if (loading) {
    return (
      <div className="app-shell flex min-h-full items-center justify-center">
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

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />
  }

  return (
    <GroupsProvider>
      <EntriesProvider>
        <AppContent onOpenSettings={() => setShowSettings(true)} />
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
