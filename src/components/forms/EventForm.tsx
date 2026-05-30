import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useEntries } from '../../context/EntriesContext'
import type { EventEntry, EventColor, RepeatOption } from '../../types'
import { preserveEntryMeta } from '../../utils/entryMeta'
import { DEFAULT_EVENT_COLOR, REPEAT_LABELS } from '../../types'
import {
  FormField,
  inputClassName,
  Select,
  buttonPrimaryClassName,
} from './FormField'
import { EventColorPicker } from './EventColorPicker'

interface EventFormProps {
  entry?: EventEntry
  onSuccess: () => void
}

export function EventForm({ entry, onSuccess }: EventFormProps) {
  const { username } = useAuth()
  const { addEntry, updateEntry } = useEntries()
  const [title, setTitle] = useState(entry?.title ?? '')
  const [date, setDate] = useState(entry?.date ?? '')
  const [repeat, setRepeat] = useState<RepeatOption>(entry?.repeat ?? 'never')
  const [repeatOn, setRepeatOn] = useState(entry?.repeatOn ?? '')
  const [color, setColor] = useState<EventColor>(entry?.color ?? DEFAULT_EVENT_COLOR)

  const handleRepeatChange = (value: RepeatOption) => {
    setRepeat(value)
    if (value !== 'once') {
      setRepeatOn('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    const entryData: EventEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      category: 'events',
      title: title.trim(),
      date,
      repeat,
      repeatOn: repeat === 'once' && repeatOn ? repeatOn : undefined,
      color,
      completed:
        repeat === 'never' || repeat === 'once'
          ? (entry?.completed ?? false)
          : false,
      ...preserveEntryMeta(entry, username, Boolean(entry)),
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
          placeholder="Event title"
          required
        />
      </FormField>

      <FormField label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClassName}
          required
        />
      </FormField>

      <FormField label="Color">
        <EventColorPicker value={color} onChange={setColor} />
      </FormField>

      <FormField label="Repeat" optional>
        <Select
          value={repeat}
          onChange={(e) => handleRepeatChange(e.target.value as RepeatOption)}
        >
          {(Object.keys(REPEAT_LABELS) as RepeatOption[]).map((option) => (
            <option key={option} value={option}>
              {REPEAT_LABELS[option]}
            </option>
          ))}
        </Select>
      </FormField>

      {repeat === 'once' && (
        <FormField label="Repeat on" optional>
          <input
            type="date"
            value={repeatOn}
            onChange={(e) => setRepeatOn(e.target.value)}
            className={inputClassName}
          />
        </FormField>
      )}

      <button
        type="submit"
        disabled={!title.trim() || !date}
        className={buttonPrimaryClassName}
      >
        {entry ? 'Update event' : 'Save event'}
      </button>
    </form>
  )
}
