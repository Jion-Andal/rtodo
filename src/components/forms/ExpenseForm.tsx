import { useState } from 'react'
import { useEntries } from '../../context/EntriesContext'
import type { ExpenseEntry } from '../../types'
import {
  FormField,
  inputClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
} from './FormField'

interface LineItemDraft {
  description: string
  amount: string
}

function createId() {
  return crypto.randomUUID()
}

function emptyLineItem(): LineItemDraft {
  return { description: '', amount: '' }
}

interface ExpenseFormProps {
  entry?: ExpenseEntry
  onSuccess: () => void
}

export function ExpenseForm({ entry, onSuccess }: ExpenseFormProps) {
  const { addEntry, updateEntry } = useEntries()
  const [title, setTitle] = useState(entry?.title ?? '')
  const [splitCount, setSplitCount] = useState(
    String(entry?.splitCount ?? 2),
  )
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(
    entry?.items.map((item) => ({
      description: item.description,
      amount: String(item.amount),
    })) ?? [emptyLineItem()],
  )

  const parsedItems = lineItems
    .map((item) => ({
      description: item.description.trim(),
      amount: parseFloat(item.amount),
    }))
    .filter(
      (item) => item.description && !isNaN(item.amount) && item.amount > 0,
    )

  const parsedSplitCount = Math.max(1, parseInt(splitCount, 10) || 2)
  const draftTotal = parsedItems.reduce((sum, item) => sum + item.amount, 0)
  const draftSplit =
    draftTotal > 0 ? draftTotal / parsedSplitCount : null

  const addLineItem = () => setLineItems((prev) => [...prev, emptyLineItem()])
  const removeLineItem = (index: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  const updateLineItem = (
    index: number,
    field: keyof LineItemDraft,
    value: string,
  ) =>
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || parsedItems.length === 0) return

    const entryData: ExpenseEntry = {
      id: entry?.id ?? createId(),
      category: 'expenses',
      title: title.trim(),
      items: parsedItems.map((item, index) => ({
        id: entry?.items[index]?.id ?? createId(),
        description: item.description,
        amount: item.amount,
      })),
      splitCount: parsedSplitCount,
      completed: entry?.completed ?? false,
      createdAt: entry?.createdAt ?? new Date().toISOString(),
    }

    if (entry) {
      updateEntry(entryData)
    } else {
      addEntry(entryData)
    }
    onSuccess()
  }

  const isValid = title.trim() && parsedItems.length > 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="Expense title"
          required
        />
      </FormField>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink dark:text-mint-100">
          Description & amount
        </span>

        <div className="overflow-hidden rounded-xl border border-border bg-mint-50/60 dark:border-border-strong dark:bg-[#243038]/60">
          <div
            className={`grid gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted dark:border-border-strong dark:text-ink-faint ${
              lineItems.length > 1
                ? 'grid-cols-[minmax(0,7fr)_minmax(0,3fr)_2rem]'
                : 'grid-cols-[minmax(0,7fr)_minmax(0,3fr)]'
            }`}
          >
            <span>Description</span>
            <span className="text-right">Amount</span>
            {lineItems.length > 1 && <span className="sr-only">Remove</span>}
          </div>

          <div className="divide-y divide-border dark:divide-border-strong">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className={`grid items-center gap-2 px-2 py-2 ${
                  lineItems.length > 1
                    ? 'grid-cols-[minmax(0,7fr)_minmax(0,3fr)_2rem]'
                    : 'grid-cols-[minmax(0,7fr)_minmax(0,3fr)]'
                }`}
              >
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(index, 'description', e.target.value)
                  }
                  className={`${inputClassName} min-w-0 bg-surface dark:bg-[#2a363e]`}
                  placeholder="What was this for?"
                />

                <div className="relative min-w-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) =>
                      updateLineItem(index, 'amount', e.target.value)
                    }
                    className={`${inputClassName} bg-surface pl-7 text-right tabular-nums dark:bg-[#2a363e]`}
                    placeholder="0.00"
                  />
                </div>

                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    aria-label="Remove line item"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-peach-100 hover:text-peach-400 dark:hover:bg-peach-400/10 dark:hover:text-peach-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.368 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.368 0c.729 0 1.304.596 1.304 1.312v.227H8.06v-.227c0-.716.575-1.312 1.304-1.312zM9.75 8.25v8.25m3-8.25v8.25m3-8.25v8.25"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={addLineItem}
          className={`${buttonSecondaryClassName} mt-2 w-full`}
        >
          + Add another item
        </button>
      </div>

      <FormField label="Split between">
        <input
          type="number"
          min="1"
          step="1"
          value={splitCount}
          onChange={(e) => setSplitCount(e.target.value)}
          className={`${inputClassName} w-24 tabular-nums`}
          required
        />
      </FormField>

      {draftSplit !== null && (
        <div className="rounded-xl bg-sage-100 px-4 py-3 dark:bg-sage-500/10">
          <p className="text-sm text-sage-500 dark:text-sage-300">
            Total:{' '}
            <span className="font-semibold">{formatCurrency(draftTotal)}</span>
          </p>
          <p className="mt-1 text-sm text-sage-500 dark:text-sage-300">
            Split amount (÷ {parsedSplitCount}):{' '}
            <span className="font-semibold">{formatCurrency(draftSplit)}</span>
          </p>
        </div>
      )}

      <button type="submit" disabled={!isValid} className={buttonPrimaryClassName}>
        {entry ? 'Update expense' : 'Save expense'}
      </button>
    </form>
  )
}
