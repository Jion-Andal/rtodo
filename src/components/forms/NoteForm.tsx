import { useState } from 'react'
import { useEntries } from '../../context/EntriesContext'
import type { NoteEntry } from '../../types'
import {
  FormField,
  inputClassName,
  buttonPrimaryClassName,
} from './FormField'

interface NoteFormProps {
  entry?: NoteEntry
  onSuccess: () => void
}

export function NoteForm({ entry, onSuccess }: NoteFormProps) {
  const { addEntry, updateEntry } = useEntries()
  const [title, setTitle] = useState(entry?.title ?? '')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [dueDate, setDueDate] = useState(entry?.dueDate ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const entryData: NoteEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      category: 'notes',
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder="Note title"
          required
        />
      </FormField>

      <FormField label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="Write your note..."
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

      <button
        type="submit"
        disabled={!title.trim() || !description.trim()}
        className={buttonPrimaryClassName}
      >
        {entry ? 'Update note' : 'Save note'}
      </button>
    </form>
  )
}
