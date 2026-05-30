import type { ExpenseEntry } from '../types'
import { getExpenseTotal } from '../types'

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function formatExpenseCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export function getExpenseEntryMonth(entry: ExpenseEntry): { year: number; month: number } {
  const date = new Date(entry.createdAt)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function getMonthlyTotalsForYear(
  entries: ExpenseEntry[],
  year: number,
): number[] {
  const totals = Array.from({ length: 12 }, () => 0)

  for (const entry of entries) {
    const { year: entryYear, month } = getExpenseEntryMonth(entry)
    if (entryYear === year) {
      totals[month - 1] += getExpenseTotal(entry)
    }
  }

  return totals
}

export function getExpensesForMonth(
  entries: ExpenseEntry[],
  year: number,
  month: number,
): ExpenseEntry[] {
  return entries.filter((entry) => {
    const { year: entryYear, month: entryMonth } = getExpenseEntryMonth(entry)
    return entryYear === year && entryMonth === month
  })
}

export function getMonthExpenseTotal(
  entries: ExpenseEntry[],
  year: number,
  month: number,
): number {
  return getExpensesForMonth(entries, year, month).reduce(
    (sum, entry) => sum + getExpenseTotal(entry),
    0,
  )
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}
