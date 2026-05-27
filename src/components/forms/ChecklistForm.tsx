import { useState } from 'react'
import { useEntries } from '../../context/EntriesContext'
import type { ChecklistEntry } from '../../types'
import {
  FormField,
  inputClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
} from './FormField'

function createId() {
  return crypto.randomUUID()
}

interface ChecklistItemDraft {
  text: string
}

function emptyItem(): ChecklistItemDraft {
  return { text: '' }
}

interface ChecklistFormProps {
  entry?: ChecklistEntry
  onSuccess: () => void
}

export function ChecklistForm({ entry, onSuccess }: ChecklistFormProps) {
  const { addEntry, updateEntry } = useEntries()
  const [title, setTitle] = useState(entry?.title ?? '')
  const [dueDate, setDueDate] = useState(entry?.dueDate ?? '')
  const [items, setItems] = useState<ChecklistItemDraft[]>(
    entry?.items.map((item) => ({ text: item.text })) ?? [emptyItem()],
  )

  const addItem = () => setItems((prev) => [...prev, emptyItem()])
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index))
  const updateItem = (index: number, value: string) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: value } : item)),
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedItems = items
      .map((item) => item.text.trim())
      .filter(Boolean)

    if (!title.trim() || trimmedItems.length === 0) return

    const entryData: ChecklistEntry = {
      id: entry?.id ?? createId(),
      category: 'checklist',
      title: title.trim(),
      dueDate: dueDate || undefined,
      items: trimmedItems.map((text, index) => ({
        id: entry?.items[index]?.id ?? createId(),
        text,
        checked: entry?.items[index]?.checked ?? false,
      })),
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

  const isValid = title.trim() && items.some((item) => item.text.trim())

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="Checklist title"
          required
        />
      </FormField>

      <FormField label="Due date" optional>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClassName}
        />
      </FormField>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink dark:text-mint-100">
          Checklist items
        </span>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`grid items-center gap-2 ${
                items.length > 1
                  ? 'grid-cols-[minmax(0,1fr)_2rem]'
                  : 'grid-cols-1'
              }`}
            >
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(index, e.target.value)}
                className={`${inputClassName} min-w-0 bg-surface dark:bg-[#2a363e]`}
                placeholder={`Item ${index + 1}`}
              />

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label="Remove item"
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
        <button
          type="button"
          onClick={addItem}
          className={`${buttonSecondaryClassName} mt-2 w-full`}
        >
          + Add item
        </button>
      </div>

      <button type="submit" disabled={!isValid} className={buttonPrimaryClassName}>
        {entry ? 'Update checklist' : 'Save checklist'}
      </button>
    </form>
  )
}
