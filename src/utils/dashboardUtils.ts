import type { ChecklistEntry, NoteEntry } from '../types'
import { getTodayDateKey } from './eventCalendar'

type DueDatedEntry = ChecklistEntry | NoteEntry

function dueDateDistance(dueDate: string, today: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime()
  const now = new Date(`${today}T00:00:00`).getTime()
  return Math.abs(due - now)
}

export function getNearestDueEntry<T extends DueDatedEntry>(entries: T[]): T | null {
  const today = getTodayDateKey()
  const candidates = entries.filter((entry) => !entry.completed && entry.dueDate)
  if (candidates.length === 0) return null

  return [...candidates].sort((a, b) => {
    const distanceDiff =
      dueDateDistance(a.dueDate!, today) - dueDateDistance(b.dueDate!, today)
    if (distanceDiff !== 0) return distanceDiff
    return a.dueDate!.localeCompare(b.dueDate!)
  })[0]
}

export function formatDueDateLabel(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
