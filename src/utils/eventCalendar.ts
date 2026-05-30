import type { EventEntry } from '../types'

export function dateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month, day }
}

export function eventOccursOnDate(entry: EventEntry, dateKey: string): boolean {
  if (entry.date === dateKey) return true
  if (entry.repeat === 'once' && entry.repeatOn === dateKey) return true
  if (entry.repeat === 'never' || entry.repeat === 'once') return false

  const target = new Date(`${dateKey}T00:00:00`)
  const start = new Date(`${entry.date}T00:00:00`)
  if (target < start) return false

  const { month, day } = parseDateKey(dateKey)
  const startParts = parseDateKey(entry.date)

  switch (entry.repeat) {
    case 'weekly':
      return target.getDay() === start.getDay()
    case 'monthly':
      return day === startParts.day
    case 'annually':
      return month === startParts.month && day === startParts.day
    default:
      return false
  }
}

export function getEventsForDate(entries: EventEntry[], dateKey: string): EventEntry[] {
  return entries.filter((entry) => eventOccursOnDate(entry, dateKey))
}

export function dateHasEvents(entries: EventEntry[], dateKey: string): boolean {
  return entries.some((entry) => eventOccursOnDate(entry, dateKey))
}

export interface CalendarCell {
  day: number
  month: number
  year: number
  inCurrentMonth: boolean
}

export function getCalendarCells(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    cells.push({ day, month: prevMonth, year: prevYear, inCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, month, year, inCurrentMonth: true })
  }

  let nextDay = 1
  let nextMonth = month === 12 ? 1 : month + 1
  let nextYear = month === 12 ? year + 1 : year

  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({
      day: nextDay,
      month: nextMonth,
      year: nextYear,
      inCurrentMonth: false,
    })
    nextDay++
    if (nextDay > new Date(nextYear, nextMonth, 0).getDate()) {
      nextDay = 1
      if (nextMonth === 12) {
        nextMonth = 1
        nextYear++
      } else {
        nextMonth++
      }
    }
  }

  return cells
}

export function getTodayDateKey(): string {
  const now = new Date()
  return dateKeyFromParts(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function formatDisplayDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
