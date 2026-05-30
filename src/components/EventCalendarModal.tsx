import { useEffect, useMemo, useState, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import { useEntries } from '../context/EntriesContext'
import type { EventEntry } from '../types'
import { REPEAT_LABELS } from '../types'
import {
  getEventColor,
  getEventColorCellClass,
  getEventColorDotClass,
  getEventColorSwatchClass,
} from '../utils/eventColors'
import {
  dateKeyFromParts,
  formatDisplayDate,
  getCalendarCells,
  getEventsForDate,
  getTodayDateKey,
} from '../utils/eventCalendar'

interface EventCalendarModalProps {
  open: boolean
  onClose: () => void
  onEdit: (entry: EventEntry) => void
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const DETAILS_TRANSITION_MS = 450
const MAX_CALENDAR_DOTS = 4

function getDayHighlightClass(events: EventEntry[]): string {
  if (events.length === 1) {
    return `${getEventColorCellClass(getEventColor(events[0]))} font-medium`
  }

  return 'bg-surface-muted/70 font-medium hover:bg-surface-muted dark:bg-dark-panel/70 dark:hover:bg-dark-panel'
}

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EventDetailCard({
  entry,
  onEdit,
}: {
  entry: EventEntry
  onEdit: (entry: EventEntry) => void
}) {
  const color = getEventColor(entry)

  return (
    <article
      className={`panel p-3.5 ${entry.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${getEventColorSwatchClass(color)}`}
              aria-hidden="true"
            />
            <h3
              className={`min-w-0 text-sm font-medium text-ink dark:text-zinc-100 ${
                entry.completed ? 'line-through' : ''
              }`}
            >
              {entry.title}
            </h3>
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-ink-muted dark:text-zinc-400">
            <p>Event date: {formatShortDate(entry.date)}</p>
            {entry.repeat === 'once' && entry.repeatOn && (
              <p className="text-peach-400 dark:text-peach-300">
                Repeat on: {formatShortDate(entry.repeatOn)}
              </p>
            )}
            <p className="text-[11px] text-ink-faint">
              Repeats: {REPEAT_LABELS[entry.repeat]}
            </p>
            {entry.completed && (
              <p className="text-[11px] text-mint-600 dark:text-mint-400">Completed</p>
            )}
          </div>
        </div>
        {!entry.completed && (
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="btn-compact shrink-0 border border-border/80 bg-surface/90 px-2.5 py-1.5 text-xs font-medium text-ink shadow-sm hover:border-border-strong hover:bg-surface dark:border-dark-border/80 dark:bg-dark-elevated/90 dark:text-zinc-200 dark:hover:bg-dark-elevated"
          >
            Edit
          </button>
        )}
      </div>
    </article>
  )
}

export function EventCalendarModal({ open, onClose, onEdit }: EventCalendarModalProps) {
  const { entries } = useEntries()
  const todayKey = getTodayDateKey()
  const todayParts = useMemo(() => {
    const [year, month] = todayKey.split('-').map(Number)
    return { year, month }
  }, [todayKey])

  const [viewYear, setViewYear] = useState(todayParts.year)
  const [viewMonth, setViewMonth] = useState(todayParts.month)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [displayedDateKey, setDisplayedDateKey] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setViewYear(todayParts.year)
      setViewMonth(todayParts.month)
      setSelectedDateKey(null)
      setDisplayedDateKey(null)
    }
  }, [open, todayParts.year, todayParts.month])

  useEffect(() => {
    if (selectedDateKey) {
      setDisplayedDateKey(selectedDateKey)
      return
    }

    if (!displayedDateKey) return

    const timer = window.setTimeout(
      () => setDisplayedDateKey(null),
      DETAILS_TRANSITION_MS + 50,
    )
    return () => window.clearTimeout(timer)
  }, [selectedDateKey, displayedDateKey])

  const eventEntries = useMemo(
    () => entries.filter((entry): entry is EventEntry => entry.category === 'events'),
    [entries],
  )

  const calendarCells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const displayedEvents = useMemo(
    () => (displayedDateKey ? getEventsForDate(eventEntries, displayedDateKey) : []),
    [eventEntries, displayedDateKey],
  )

  const detailsExpanded = selectedDateKey !== null

  const handleDetailsTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (!selectedDateKey) {
      setDisplayedDateKey(null)
    }
  }

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const goToPrevMonth = () => {
    setSelectedDateKey(null)
    if (viewMonth === 1) {
      setViewYear((y) => y - 1)
      setViewMonth(12)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    setSelectedDateKey(null)
    if (viewMonth === 12) {
      setViewYear((y) => y + 1)
      setViewMonth(1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleClose = () => {
    setSelectedDateKey(null)
    onClose()
  }

  const handleEdit = (entry: EventEntry) => {
    handleClose()
    onEdit(entry)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close calendar"
        className="modal-backdrop"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="panel max-h-[min(90dvh,720px)] overflow-y-auto p-5 shadow-[var(--shadow-elevated)] transition-[box-shadow] duration-[450ms] ease-[cubic-bezier(0.33,1,0.68,1)] sm:p-6"
          style={{ transitionDuration: `${DETAILS_TRANSITION_MS}ms` }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink dark:text-zinc-100">
              Calendar
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink dark:hover:bg-dark-panel dark:hover:text-zinc-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="btn-icon h-8 w-8"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-ink dark:text-zinc-100">{monthLabel}</p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="btn-icon h-8 w-8"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

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
              const isSelected = dateKey === selectedDateKey

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    if (selectedDateKey === dateKey) {
                      setSelectedDateKey(null)
                    } else {
                      setSelectedDateKey(dateKey)
                      setDisplayedDateKey(dateKey)
                    }
                  }}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all duration-150 ${
                    !cell.inCurrentMonth
                      ? 'text-ink-faint/50 dark:text-zinc-600'
                      : 'text-ink dark:text-zinc-200'
                  } ${
                    isSelected
                      ? 'bg-mint-600 font-semibold text-white shadow-sm dark:bg-mint-500'
                      : isToday
                        ? 'ring-2 ring-mint-400/60 ring-offset-1 ring-offset-surface dark:ring-mint-500/50 dark:ring-offset-dark-elevated'
                        : hasEvents
                          ? getDayHighlightClass(dayEvents)
                          : 'hover:bg-surface-muted dark:hover:bg-dark-panel'
                  }`}
                  aria-label={`${cell.day}${hasEvents ? ', has events' : ''}${isSelected ? ', selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span>{cell.day}</span>
                  {hasEvents && !isSelected && (
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
                </button>
              )
            })}
          </div>

          <div
            className={`grid transition-[grid-template-rows] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${
              detailsExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
            style={{ transitionDuration: `${DETAILS_TRANSITION_MS}ms` }}
            onTransitionEnd={handleDetailsTransitionEnd}
          >
            <div className="min-h-0 overflow-hidden">
              {displayedDateKey && (
                <div
                  className={`mt-5 border-t border-border/70 pt-5 transition-[opacity,transform] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none dark:border-dark-border/70 ${
                    detailsExpanded
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-3 opacity-0'
                  }`}
                  style={{
                    transitionDuration: `${DETAILS_TRANSITION_MS - 50}ms`,
                    transitionDelay: detailsExpanded ? '75ms' : '0ms',
                  }}
                >
                  <h3 className="mb-3 text-sm font-semibold text-ink dark:text-zinc-100">
                    {formatDisplayDate(displayedDateKey)}
                  </h3>

                  {displayedEvents.length === 0 ? (
                    <p className="text-sm text-ink-muted dark:text-ink-faint">
                      No events on this date.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {displayedEvents.map((entry) => (
                        <li key={entry.id}>
                          <EventDetailCard entry={entry} onEdit={handleEdit} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
