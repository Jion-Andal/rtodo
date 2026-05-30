export type Category = 'checklist' | 'notes' | 'events' | 'expenses'

export type RepeatOption = 'never' | 'once' | 'weekly' | 'monthly' | 'annually'

export type EventColor = 'mint' | 'peach' | 'sage' | 'sky' | 'rose' | 'violet'

export const EVENT_COLORS: EventColor[] = ['mint', 'peach', 'sage', 'sky', 'rose', 'violet']

export const DEFAULT_EVENT_COLOR: EventColor = 'mint'

export const EVENT_COLOR_LABELS: Record<EventColor, string> = {
  mint: 'Mint',
  peach: 'Peach',
  sage: 'Sage',
  sky: 'Sky',
  rose: 'Rose',
  violet: 'Violet',
}

export interface BaseEntry {
  id: string
  title: string
  completed: boolean
  createdAt: string
  createdBy?: string
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface ChecklistEntry extends BaseEntry {
  category: 'checklist'
  dueDate?: string
  items: ChecklistItem[]
}

export interface NoteEntry extends BaseEntry {
  category: 'notes'
  description: string
  dueDate?: string
}

export interface EventEntry extends BaseEntry {
  category: 'events'
  date: string
  repeat: RepeatOption
  repeatOn?: string
  color?: EventColor
}

export function eventShowsCheckbox(repeat: RepeatOption): boolean {
  return repeat === 'never' || repeat === 'once'
}

export interface ExpenseLineItem {
  id: string
  description: string
  amount: number
}

export interface ExpenseEntry extends BaseEntry {
  category: 'expenses'
  items: ExpenseLineItem[]
  splitCount?: number
}

export function getExpenseTotal(entry: ExpenseEntry): number {
  return entry.items.reduce((sum, item) => sum + item.amount, 0)
}

export function getExpenseSplitCount(entry: ExpenseEntry): number {
  return entry.splitCount ?? 2
}

export function getExpenseSplit(entry: ExpenseEntry): number {
  return getExpenseTotal(entry) / getExpenseSplitCount(entry)
}

export type Entry = ChecklistEntry | NoteEntry | EventEntry | ExpenseEntry

export const CATEGORY_LABELS: Record<Category, string> = {
  checklist: 'Checklist',
  notes: 'Notes',
  events: 'Events',
  expenses: 'Expenses',
}

export const CATEGORY_SINGULAR: Record<Category, string> = {
  checklist: 'Checklist',
  notes: 'Note',
  events: 'Event',
  expenses: 'Expense',
}

export const REPEAT_LABELS: Record<RepeatOption, string> = {
  never: 'Never',
  once: 'Once',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annually: 'Annually',
}
