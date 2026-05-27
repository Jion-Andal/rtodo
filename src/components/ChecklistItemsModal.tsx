import { useEntries } from '../context/EntriesContext'
import type { ChecklistEntry } from '../types'
import { Modal } from './Modal'

interface ChecklistItemsModalProps {
  entryId: string | null
  onClose: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ChecklistItemsModal({ entryId, onClose }: ChecklistItemsModalProps) {
  const { entries, toggleChecklistItem } = useEntries()

  const entry = entries.find(
    (e): e is ChecklistEntry => e.id === entryId && e.category === 'checklist',
  )

  if (!entry) return null

  const checkedCount = entry.items.filter((item) => item.checked).length
  const totalCount = entry.items.length

  return (
    <Modal open={entryId !== null} onClose={onClose} title={entry.title}>
      <div className="space-y-4">
        {entry.dueDate && (
          <p className="text-sm text-peach-400 dark:text-peach-300">
            Due: {formatDate(entry.dueDate)}
          </p>
        )}

        <p className="text-xs text-ink-muted dark:text-ink-faint">
          {checkedCount} of {totalCount} completed
        </p>

        <ul className="space-y-2">
          {entry.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleChecklistItem(entry.id, item.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-mint-50/80 px-3 py-2.5 text-left transition-colors hover:border-mint-300 hover:bg-mint-100/80 dark:border-border-strong dark:bg-[#243038]/80 dark:hover:border-mint-500/50 dark:hover:bg-mint-600/10"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 shadow-sm transition-all ${
                    item.checked
                      ? 'border-mint-500 bg-mint-400 text-white ring-2 ring-mint-300/40'
                      : 'border-mint-300 bg-mint-50 dark:border-mint-500/60 dark:bg-mint-600/20'
                  }`}
                >
                  {item.checked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-sm text-ink dark:text-mint-50 ${
                      item.checked ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.remarks && (
                    <p className="mt-0.5 text-xs text-ink-muted dark:text-ink-faint">
                      {item.remarks}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
