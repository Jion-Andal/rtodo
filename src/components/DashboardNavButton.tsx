import { useCallback, useEffect, useRef, type MouseEvent } from 'react'
import type { AppView, Category } from '../types'
import { CATEGORY_LABELS } from '../types'

export const DASHBOARD_LONG_PRESS_MS = 3000

export const DASHBOARD_ICON_PATH =
  'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'

const CATEGORY_ICONS: Record<Category, string> = {
  checklist:
    'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  notes:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  events:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  expenses:
    'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
}

const MOBILE_CATEGORIES: Category[] = ['checklist', 'notes', 'events', 'expenses']

interface DashboardNavButtonProps {
  active: boolean
  onClick: () => void
  onEasterEgg?: () => void
  layout?: 'mobile-center' | 'desktop'
  compact?: boolean
}

export function DashboardNavButton({
  active,
  onClick,
  onEasterEgg,
  layout = 'desktop',
  compact = false,
}: DashboardNavButtonProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  useEffect(() => () => clearLongPress(), [clearLongPress])

  const handlePointerDown = () => {
    if (!onEasterEgg) return
    clearLongPress()
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      onEasterEgg()
    }, DASHBOARD_LONG_PRESS_MS)
  }

  const handlePointerUp = () => {
    clearLongPress()
  }

  const handleClick = () => {
    if (longPressFired.current) {
      longPressFired.current = false
      return
    }
    onClick()
  }

  const longPressHandlers = onEasterEgg
    ? {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onContextMenu: (event: MouseEvent) => event.preventDefault(),
      }
    : {}

  if (layout === 'mobile-center') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Dashboard"
        aria-current={active ? 'page' : undefined}
        className="relative -mt-5 flex shrink-0 touch-manipulation select-none flex-col items-center"
        {...longPressHandlers}
      >
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface shadow-lg transition-all duration-200 dark:border-dark-panel ${
            active
              ? 'bg-mint-600 text-white dark:bg-mint-500'
              : 'bg-mint-500 text-white hover:bg-mint-600 dark:bg-mint-500/90 dark:hover:bg-mint-400'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.25}
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={DASHBOARD_ICON_PATH} />
          </svg>
        </span>
        <span className="mt-1 text-[10px] font-semibold text-ink-muted dark:text-zinc-400">
          Dashboard
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={compact ? 'Dashboard' : undefined}
      aria-current={active ? 'page' : undefined}
      className={`nav-pill touch-manipulation select-none ${
        compact ? 'flex-none justify-center px-2 py-2.5' : 'flex-none flex-row justify-start px-3 py-2.5 text-sm'
      } ${active ? 'nav-pill-active' : 'nav-pill-inactive'}`}
      {...longPressHandlers}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.25 : 1.75}
        stroke="currentColor"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={DASHBOARD_ICON_PATH} />
      </svg>
      <span className={compact ? 'sr-only' : undefined}>Dashboard</span>
    </button>
  )
}

interface MobileFooterNavProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onDashboardEasterEgg?: () => void
}

function CategoryFooterButton({
  category,
  active,
  onClick,
}: {
  category: Category
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`nav-pill flex-1 ${active ? 'nav-pill-active' : 'nav-pill-inactive'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.25 : 1.75}
        stroke="currentColor"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[category]} />
      </svg>
      <span>{CATEGORY_LABELS[category]}</span>
    </button>
  )
}

export function MobileFooterNav({
  activeView,
  onViewChange,
  onDashboardEasterEgg,
}: MobileFooterNavProps) {
  const leftCategories = MOBILE_CATEGORIES.slice(0, 2)
  const rightCategories = MOBILE_CATEGORIES.slice(2)

  return (
    <nav
      className="content-shell flex items-end gap-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
      aria-label="Main navigation"
    >
      {leftCategories.map((category) => (
        <CategoryFooterButton
          key={category}
          category={category}
          active={activeView === category}
          onClick={() => onViewChange(category)}
        />
      ))}

      <div className="flex flex-1 justify-center px-1">
        <DashboardNavButton
          layout="mobile-center"
          active={activeView === 'dashboard'}
          onClick={() => onViewChange('dashboard')}
          onEasterEgg={onDashboardEasterEgg}
        />
      </div>

      {rightCategories.map((category) => (
        <CategoryFooterButton
          key={category}
          category={category}
          active={activeView === category}
          onClick={() => onViewChange(category)}
        />
      ))}
    </nav>
  )
}
