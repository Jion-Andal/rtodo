import type { DueTodayEntry } from '../utils/dueDateNotifications'

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
        className="absolute inset-0 bg-ink/30"
        onClick={onDismiss}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl dark:bg-[#2a363e]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach-100 text-peach-400 dark:bg-peach-400/20 dark:text-peach-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-.75 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-mint-50">
              Due today
            </h2>
            <p className="text-xs text-ink-muted dark:text-ink-faint">
              {entries.length} {entries.length === 1 ? 'item needs' : 'items need'} your attention
            </p>
          </div>
        </div>

        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-peach-200 bg-peach-50 px-3 py-2 dark:border-peach-400/30 dark:bg-peach-400/10"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-peach-400 dark:text-peach-300">
                {entry.category === 'checklist' ? 'Checklist' : 'Note'}
              </p>
              <p className="text-sm font-medium text-ink dark:text-mint-50">
                {entry.title}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mint-500 dark:bg-mint-500 dark:hover:bg-mint-600"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
