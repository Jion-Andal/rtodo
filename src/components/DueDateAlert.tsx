import type { DueTodayEntry } from '../utils/dueDateNotifications'
import { buttonPrimaryClassName } from './forms/FormField'

interface DueDateAlertProps {
  entries: DueTodayEntry[]
  onDismiss: () => void
}

export function DueDateAlert({ entries, onDismiss }: DueDateAlertProps) {
  if (entries.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Dismiss alert"
        className="modal-backdrop"
        onClick={onDismiss}
      />
      <div className="panel relative z-10 w-full max-w-sm p-6 shadow-[var(--shadow-elevated)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-peach-100 text-peach-400 dark:bg-peach-400/15 dark:text-peach-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-.75 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-zinc-100">
              Due today
            </h2>
            <p className="text-xs text-ink-muted dark:text-zinc-400">
              {entries.length} {entries.length === 1 ? 'item needs' : 'items need'} your attention
            </p>
          </div>
        </div>

        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-peach-200 bg-peach-50 px-3 py-2 dark:border-peach-400/25 dark:bg-peach-400/10"
            >
              <p className="text-[11px] font-medium text-peach-400 dark:text-peach-300">
                {entry.category === 'checklist' ? 'Checklist' : 'Note'}
              </p>
              <p className="text-sm font-medium text-ink dark:text-zinc-100">
                {entry.title}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onDismiss}
          className={buttonPrimaryClassName}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
