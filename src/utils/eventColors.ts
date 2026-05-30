import {
  DEFAULT_EVENT_COLOR,
  type EventColor,
  type EventEntry,
} from '../types'

export const EVENT_COLOR_SWATCH: Record<EventColor, string> = {
  mint: 'bg-mint-500 dark:bg-mint-400',
  peach: 'bg-peach-400',
  sage: 'bg-sage-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
}

export const EVENT_COLOR_DOT: Record<EventColor, string> = {
  mint: 'bg-mint-500 dark:bg-mint-400',
  peach: 'bg-peach-400',
  sage: 'bg-sage-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
}

export const EVENT_COLOR_CELL: Record<EventColor, string> = {
  mint: 'bg-mint-50 hover:bg-mint-100 dark:bg-mint-500/10 dark:hover:bg-mint-500/20',
  peach: 'bg-peach-50 hover:bg-peach-100 dark:bg-peach-400/10 dark:hover:bg-peach-400/20',
  sage: 'bg-sage-100 hover:bg-green-100 dark:bg-sage-500/10 dark:hover:bg-sage-500/20',
  sky: 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20',
  rose: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20',
  violet: 'bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20',
}

export function getEventColor(entry: Pick<EventEntry, 'color'>): EventColor {
  return entry.color ?? DEFAULT_EVENT_COLOR
}

export function getEventColorDotClass(color: EventColor): string {
  return EVENT_COLOR_DOT[color]
}

export function getEventColorSwatchClass(color: EventColor): string {
  return EVENT_COLOR_SWATCH[color]
}

export function getEventColorCellClass(color: EventColor): string {
  return EVENT_COLOR_CELL[color]
}
