import { Fragment } from 'react'
import type { Category } from '../types'
import { CATEGORY_LABELS } from '../types'

const CATEGORIES: Category[] = ['checklist', 'notes', 'events', 'expenses']

const ICONS: Record<Category, string> = {
  checklist: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  notes: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  events: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  expenses: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
}

const CALENDAR_ICON_PATH =
  'M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 6a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v9.75a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V8.25z'

const BANKNOTES_ICON_PATH =
  'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9.5v5.25A2.25 2.25 0 005.25 17h13.5A2.25 2.25 0 0021 14.75V9.5M12 3v6m0 0-3-3m3 3 3-3M3 9.5h18'

interface CategoryNavProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  layout?: 'horizontal' | 'vertical'
  compact?: boolean
  className?: string
  onViewEventCalendar?: () => void
  eventCalendarOpen?: boolean
  onViewExpenseCalculations?: () => void
  expenseCalculationsOpen?: boolean
}

export function CategoryNav({
  activeCategory,
  onCategoryChange,
  layout = 'horizontal',
  compact = false,
  className = '',
  onViewEventCalendar,
  eventCalendarOpen = false,
  onViewExpenseCalculations,
  expenseCalculationsOpen = false,
}: CategoryNavProps) {
  const isVertical = layout === 'vertical'
  const showEventCalendarSubNav =
    isVertical && activeCategory === 'events' && onViewEventCalendar !== undefined
  const showExpenseCalculationsSubNav =
    isVertical && activeCategory === 'expenses' && onViewExpenseCalculations !== undefined

  return (
    <nav
      className={`${isVertical ? 'flex flex-col gap-1' : 'flex w-full items-stretch gap-1'} ${className}`}
      aria-label="Categories"
    >
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category
        const showEventsSubNav =
          showEventCalendarSubNav && category === 'events'
        const showExpensesSubNav =
          showExpenseCalculationsSubNav && category === 'expenses'

        const categoryButton = (
          <button
            type="button"
            onClick={() => onCategoryChange(category)}
            title={compact ? CATEGORY_LABELS[category] : undefined}
            className={`nav-pill ${
              isVertical
                ? compact
                  ? 'flex-none justify-center px-2 py-2.5'
                  : 'flex-none flex-row justify-start px-3 py-2.5 text-sm'
                : ''
            } ${isActive ? 'nav-pill-active' : 'nav-pill-inactive'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={isActive ? 2.25 : 1.75}
              stroke="currentColor"
              className="h-5 w-5 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[category]} />
            </svg>
            <span className={compact ? 'sr-only' : undefined}>{CATEGORY_LABELS[category]}</span>
          </button>
        )

        const calendarSubNav = showEventsSubNav ? (
          <button
            type="button"
            onClick={onViewEventCalendar}
            title={compact ? 'View Calendar' : undefined}
            aria-current={eventCalendarOpen ? 'page' : undefined}
            className={`nav-pill ${
              compact
                ? 'flex-none justify-center px-2 py-2'
                : 'nav-sub-pill'
            } ${eventCalendarOpen ? 'nav-pill-active' : 'nav-pill-inactive'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM13.5 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path
                fillRule="evenodd"
                d={CALENDAR_ICON_PATH}
                clipRule="evenodd"
              />
            </svg>
            <span className={compact ? 'sr-only' : undefined}>View Calendar</span>
          </button>
        ) : null

        const calculationsSubNav = showExpensesSubNav ? (
          <button
            type="button"
            onClick={onViewExpenseCalculations}
            title={compact ? 'View calculations' : undefined}
            aria-current={expenseCalculationsOpen ? 'page' : undefined}
            className={`nav-pill ${
              compact
                ? 'flex-none justify-center px-2 py-2'
                : 'nav-sub-pill'
            } ${expenseCalculationsOpen ? 'nav-pill-active' : 'nav-pill-inactive'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={BANKNOTES_ICON_PATH} />
            </svg>
            <span className={compact ? 'sr-only' : undefined}>View calculations</span>
          </button>
        ) : null

        if (isVertical) {
          return (
            <div
              key={category}
              className={showEventsSubNav || showExpensesSubNav ? 'flex flex-col gap-0.5' : undefined}
            >
              {categoryButton}
              {calendarSubNav}
              {calculationsSubNav}
            </div>
          )
        }

        return <Fragment key={category}>{categoryButton}</Fragment>
      })}
    </nav>
  )
}
