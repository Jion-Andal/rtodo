import { FAVICON_URL } from '../lib/assetUrl'
import type { AppView, Category } from '../types'
import { CategoryNav } from './CategoryNav'
import { DashboardNavButton } from './DashboardNavButton'

interface DesktopSidebarProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onDashboardEasterEgg?: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
  showCompleted?: boolean
  onViewEventCalendar?: () => void
  eventCalendarOpen?: boolean
  onViewExpenseCalculations?: () => void
  expenseCalculationsOpen?: boolean
}

export function DesktopSidebar({
  activeView,
  onViewChange,
  onDashboardEasterEgg,
  collapsed,
  onToggleCollapsed,
  showCompleted = false,
  onViewEventCalendar,
  eventCalendarOpen = false,
  onViewExpenseCalculations,
  expenseCalculationsOpen = false,
}: DesktopSidebarProps) {
  const activeCategory: Category | null =
    activeView === 'dashboard' ? null : activeView
  return (
    <aside
      className={`desktop-sidebar ${collapsed ? 'desktop-sidebar--collapsed' : ''} ${
        showCompleted ? 'chrome-completed' : ''
      }`}
      aria-label="Main navigation"
    >
      <div
        className={`flex border-b border-border/70 dark:border-dark-border/70 ${
          collapsed
            ? 'flex-col items-center gap-2 px-2 py-3'
            : 'items-center gap-3 px-5 py-4'
        }`}
      >
        <img
          src={FAVICON_URL}
          alt=""
          className="h-9 w-9 shrink-0 rounded-xl shadow-sm ring-1 ring-border/60 dark:ring-dark-border/60"
          aria-hidden="true"
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tracking-tight text-ink dark:text-zinc-100">RTodo</p>
            <p className="text-xs text-ink-faint dark:text-zinc-500">Shared lists & notes</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={`btn-icon shrink-0 ${collapsed ? '' : 'ml-auto'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${collapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        <DashboardNavButton
          compact={collapsed}
          active={activeView === 'dashboard'}
          onClick={() => onViewChange('dashboard')}
          onEasterEgg={onDashboardEasterEgg}
        />
        <CategoryNav
          layout="vertical"
          compact={collapsed}
          activeCategory={activeCategory}
          onCategoryChange={(category) => onViewChange(category)}
          onViewEventCalendar={onViewEventCalendar}
          eventCalendarOpen={eventCalendarOpen}
          onViewExpenseCalculations={onViewExpenseCalculations}
          expenseCalculationsOpen={expenseCalculationsOpen}
          className="mt-1 flex-1"
        />
      </div>
    </aside>
  )
}
