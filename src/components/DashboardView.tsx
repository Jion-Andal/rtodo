import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../context/EntriesContext'
import type { ChecklistEntry, EventEntry, ExpenseEntry, NoteEntry } from '../types'
import {
  formatExpenseCurrency,
  getMonthlyTotalsForYear,
  getMonthExpenseTotal,
} from '../utils/expenseCalculations'
import {
  dateKeyFromParts,
  getCalendarCells,
  getEventsForDate,
  getTodayDateKey,
} from '../utils/eventCalendar'
import {
  getEventColor,
  getEventColorCellClass,
  getEventColorDotClass,
} from '../utils/eventColors'
import { formatDueDateLabel, getNearestDueEntry } from '../utils/dashboardUtils'
import { ExpenseMonthlyGraph } from './ExpenseMonthlyGraph'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MAX_CALENDAR_DOTS = 4

const HELLO_GREETINGS = [
  'Hello',
  'Hola',
  'Bonjour',
  'Ciao',
  'Olá',
  'Hallo',
  'Hej',
  'Merhaba',
  'Namaste',
  'Salaam',
  'Xin chào',
  'Konichiwa',
  'Annyeong',
  'Privet',
  'Yassou',
] as const

export const DASHBOARD_EASTER_EGG_MESSAGE = 'Y U no let go?'
const GREETING_FADE_MS = 450

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDayHighlightClass(events: EventEntry[]): string {
  if (events.length === 1) {
    return `${getEventColorCellClass(getEventColor(events[0]))} font-medium`
  }
  return 'bg-surface-muted/70 font-medium dark:bg-dark-panel/70'
}

interface DueSoonCardProps {
  label: string
  entry: ChecklistEntry | NoteEntry | null
  emptyMessage: string
}

function DueSoonCard({ label, entry, emptyMessage }: DueSoonCardProps) {
  return (
    <article className="panel flex min-h-[7.5rem] flex-col p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint dark:text-zinc-500">
        {label}
      </p>
      {entry ? (
        <>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-ink dark:text-zinc-100">
            {entry.title}
          </h3>
          <p className="mt-auto pt-3 text-xs font-medium text-mint-600 dark:text-mint-400">
            Due {formatDueDateLabel(entry.dueDate!)}
          </p>
          {'description' in entry && entry.description && (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted dark:text-zinc-400">
              {entry.description}
            </p>
          )}
          {'items' in entry && entry.items.length > 0 && (
            <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
              {entry.items.filter((item) => item.checked).length}/{entry.items.length} items done
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-ink-muted dark:text-zinc-400">{emptyMessage}</p>
      )}
    </article>
  )
}

export function DashboardView({ easterEggActive = false }: { easterEggActive?: boolean }) {
  const { username } = useAuth()
  const { entries, loading } = useEntries()
  const [greetingMode, setGreetingMode] = useState<'normal' | 'easter-egg'>('normal')
  const [greetingFadingOut, setGreetingFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const helloGreeting = useMemo(
    () => HELLO_GREETINGS[Math.floor(Math.random() * HELLO_GREETINGS.length)],
    [],
  )

  useEffect(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }

    if (easterEggActive) {
      setGreetingFadingOut(false)
      setGreetingMode('easter-egg')
      return
    }

    if (greetingMode === 'easter-egg') {
      setGreetingFadingOut(true)
      fadeTimerRef.current = setTimeout(() => {
        setGreetingMode('normal')
        setGreetingFadingOut(false)
        fadeTimerRef.current = null
      }, GREETING_FADE_MS)
    }
  }, [easterEggActive, greetingMode])

  useEffect(
    () => () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    },
    [],
  )

  const isEasterEggGreeting = greetingMode === 'easter-egg'
  const greetingText = isEasterEggGreeting
    ? DASHBOARD_EASTER_EGG_MESSAGE
    : `${helloGreeting}!`
  const greetingAnimationClass = isEasterEggGreeting
    ? greetingFadingOut
      ? 'animate-easter-egg-fade-out'
      : 'animate-easter-egg-fade-in'
    : 'animate-easter-egg-fade-in'

  const today = useMemo(() => new Date(), [])
  const viewYear = today.getFullYear()
  const viewMonth = today.getMonth() + 1
  const todayKey = getTodayDateKey()

  const checklistEntries = useMemo(
    () => entries.filter((entry): entry is ChecklistEntry => entry.category === 'checklist'),
    [entries],
  )
  const noteEntries = useMemo(
    () => entries.filter((entry): entry is NoteEntry => entry.category === 'notes'),
    [entries],
  )
  const eventEntries = useMemo(
    () => entries.filter((entry): entry is EventEntry => entry.category === 'events'),
    [entries],
  )
  const expenseEntries = useMemo(
    () => entries.filter((entry): entry is ExpenseEntry => entry.category === 'expenses'),
    [entries],
  )

  const nearestChecklist = useMemo(
    () => getNearestDueEntry(checklistEntries),
    [checklistEntries],
  )
  const nearestNote = useMemo(() => getNearestDueEntry(noteEntries), [noteEntries])

  const calendarCells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const monthlyTotals = useMemo(
    () => getMonthlyTotalsForYear(expenseEntries, viewYear),
    [expenseEntries, viewYear],
  )
  const monthTotal = useMemo(
    () => getMonthExpenseTotal(expenseEntries, viewYear, viewMonth),
    [expenseEntries, viewYear, viewMonth],
  )

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <section>
        <p className="py-12 text-center text-sm text-ink-muted dark:text-ink-faint">
          Loading dashboard…
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6 pb-2 lg:space-y-8">
      <header className="flex flex-col items-start gap-2 text-left">
        <h1
          key={greetingMode}
          className={`text-4xl font-extrabold tracking-tight text-mint-600 dark:text-mint-400 sm:text-5xl ${greetingAnimationClass}`}
        >
          {greetingText}
        </h1>
        <p className="text-base text-ink-muted dark:text-zinc-400 lg:text-lg">
          Welcome to RTodo
          {username ? (
            <>
              , <span className="font-semibold text-ink dark:text-zinc-100">{username}</span>
            </>
          ) : (
            ''
          )}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <DueSoonCard
          label="Checklist"
          entry={nearestChecklist}
          emptyMessage="No checklist items with a due date"
        />
        <DueSoonCard
          label="Notes"
          entry={nearestNote}
          emptyMessage="No notes with a due date"
        />
      </div>

      <div className="panel p-4 lg:p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink dark:text-zinc-100">{monthLabel}</h2>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint"
            >
              {label}
            </div>
          ))}

          {calendarCells.map((cell) => {
            const dateKey = dateKeyFromParts(cell.year, cell.month, cell.day)
            const dayEvents = getEventsForDate(eventEntries, dateKey)
            const hasEvents = dayEvents.length > 0
            const isToday = dateKey === todayKey

            return (
              <div
                key={dateKey}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                  !cell.inCurrentMonth
                    ? 'text-ink-faint/50 dark:text-zinc-600'
                    : 'text-ink dark:text-zinc-200'
                } ${
                  isToday
                    ? 'bg-mint-600 font-semibold text-white shadow-sm dark:bg-mint-500'
                    : hasEvents
                      ? getDayHighlightClass(dayEvents)
                      : 'bg-surface-muted/40 dark:bg-dark-panel/40'
                }`}
                aria-label={`${cell.day}${hasEvents ? ', has events' : ''}${isToday ? ', today' : ''}`}
              >
                <span>{cell.day}</span>
                {hasEvents && !isToday && (
                  <span
                    className="absolute bottom-1 flex max-w-[calc(100%-0.5rem)] justify-center gap-0.5"
                    aria-hidden="true"
                  >
                    {dayEvents.slice(0, MAX_CALENDAR_DOTS).map((entry) => (
                      <span
                        key={entry.id}
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${getEventColorDotClass(getEventColor(entry))}`}
                      />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel p-4 lg:p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink dark:text-zinc-100">
            Expenses · {monthLabel}
          </h2>
          <div className="rounded-2xl border border-border/70 bg-surface-muted/50 p-3 dark:border-dark-border/70 dark:bg-dark-panel/50">
            <ExpenseMonthlyGraph
              monthlyTotals={monthlyTotals}
              selectedMonth={viewMonth}
              onSelectMonth={() => {}}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-sage-300/40 bg-sage-100 px-4 py-4 dark:border-sage-500/20 dark:bg-sage-500/10">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-500 dark:text-sage-300">
            Total expenses this month
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink dark:text-zinc-100">
            {formatExpenseCurrency(monthTotal)}
          </p>
          <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
            As of {formatShortDate(todayKey)}
          </p>
        </div>
      </div>
    </section>
  )
}
