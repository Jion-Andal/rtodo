import type { ChecklistEntry, Entry, ExpenseEntry } from '../types'
import {
  eventShowsCheckbox,
  getExpenseSplit,
  getExpenseSplitCount,
  getExpenseTotal,
  REPEAT_LABELS,
} from '../types'
import { DeleteIcon, EditIcon, IconButton } from './IconButton'

interface ItemCardProps {
  entry: Entry
  onCheckboxClick: (entry: Entry) => void
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  onChecklistClick?: (entry: ChecklistEntry) => void
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCreatedAt(isoStr: string) {
  return new Date(isoStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EntryCreatedMeta({
  createdAt,
  createdBy,
}: {
  createdAt: string
  createdBy?: string
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-ink-faint">
        Created: {formatCreatedAt(createdAt)}
      </p>
      {createdBy && (
        <p className="text-[11px] text-ink-faint">
          Created by: {createdBy}
        </p>
      )}
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function ExpenseDetails({
  entry,
  formatCurrency,
}: {
  entry: ExpenseEntry
  formatCurrency: (amount: number) => string
}) {
  const total = getExpenseTotal(entry)
  const splitCount = getExpenseSplitCount(entry)
  const split = getExpenseSplit(entry)

  return (
    <div className="mt-1">
      <ul className="space-y-0.5">
        {entry.items.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-2 text-xs text-ink-muted dark:text-zinc-400"
          >
            <span className="min-w-0 truncate">{item.description}</span>
            <span className="shrink-0 font-medium">
              {formatCurrency(item.amount)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs font-medium text-sage-500 dark:text-sage-300">
        Split (÷ {splitCount}): {formatCurrency(split)}
      </p>
      <p className="text-[11px] text-ink-faint">
        Total: {formatCurrency(total)}
      </p>
    </div>
  )
}

export function ItemCard({
  entry,
  onCheckboxClick,
  onEdit,
  onDelete,
  onChecklistClick,
}: ItemCardProps) {
  const isChecklist = entry.category === 'checklist'
  const isClickableChecklist = isChecklist && !entry.completed && onChecklistClick
  const showCheckbox =
    entry.category !== 'events' || eventShowsCheckbox(entry.repeat)

  const handleCardClick = () => {
    if (isClickableChecklist) {
      onChecklistClick(entry)
    }
  }

  return (
    <article
      onClick={isClickableChecklist ? handleCardClick : undefined}
      className={`panel p-3.5 transition-all duration-200 ${
        entry.completed ? 'opacity-55' : ''
      } ${isClickableChecklist ? 'panel-interactive cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        {showCheckbox ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCheckboxClick(entry)
            }}
            aria-label={entry.completed ? 'Mark as active' : 'Mark as completed'}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
              entry.completed
                ? 'border-mint-500 bg-mint-500 text-white dark:border-mint-400 dark:bg-mint-400'
                : 'border-border-strong bg-surface hover:border-mint-400 dark:border-dark-border dark:bg-dark-elevated dark:hover:border-mint-500'
            }`}
          >
            {entry.completed && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ) : (
          <div className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3
              className={`min-w-0 flex-1 truncate text-sm font-medium text-ink dark:text-zinc-100 ${
                entry.completed ? 'line-through' : ''
              }`}
            >
              {entry.title}
            </h3>
            <div className="flex shrink-0 items-center">
              {!entry.completed && (
                <IconButton
                  label="Edit entry"
                  onClick={() => onEdit(entry)}
                  stopPropagation
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton
                label="Delete entry"
                variant="danger"
                onClick={() => onDelete(entry)}
                stopPropagation
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>

          <EntryCreatedMeta
            createdAt={entry.createdAt}
            createdBy={entry.createdBy}
          />

          {entry.category === 'checklist' && (
            <div className="mt-1 space-y-0.5">
              {entry.dueDate && (
                <p className="text-[11px] text-peach-400 dark:text-peach-300">
                  Due: {formatDate(entry.dueDate)}
                </p>
              )}
              <ul className="space-y-1">
                {entry.items.map((item) => (
                  <li key={item.id} className="text-xs text-ink-muted dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1 w-1 shrink-0 rounded-full ${
                          item.checked ? 'bg-mint-400' : 'bg-mint-200 dark:bg-mint-600/40'
                        }`}
                      />
                      <span className={item.checked ? 'line-through opacity-60' : ''}>
                        {item.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.category === 'notes' && (
            <div className="mt-1">
              {entry.dueDate && (
                <p className="text-[11px] text-peach-400 dark:text-peach-300">
                  Due: {formatDate(entry.dueDate)}
                </p>
              )}
              <p className="line-clamp-2 text-xs text-ink-muted dark:text-zinc-400">
                {entry.description}
              </p>
            </div>
          )}

          {entry.category === 'events' && (
            <div className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
              <p>{formatDate(entry.date)}</p>
              {entry.repeat === 'once' && entry.repeatOn && (
                <p className="text-[11px] text-peach-400 dark:text-peach-300">
                  Repeat on: {formatDate(entry.repeatOn)}
                </p>
              )}
              <p className="text-[11px] text-ink-muted dark:text-ink-faint">
                Repeats: {REPEAT_LABELS[entry.repeat]}
              </p>
            </div>
          )}

          {entry.category === 'expenses' && (
            <ExpenseDetails entry={entry} formatCurrency={formatCurrency} />
          )}
        </div>
      </div>
    </article>
  )
}
