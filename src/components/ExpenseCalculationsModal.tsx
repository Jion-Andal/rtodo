import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEntries } from '../context/EntriesContext'
import type { ExpenseEntry } from '../types'
import {
  formatExpenseCurrency,
  formatMonthYear,
  getExpensesForMonth,
  getMonthlyTotalsForYear,
  getMonthExpenseTotal,
} from '../utils/expenseCalculations'
import { ExpenseMonthlyGraph } from './ExpenseMonthlyGraph'

interface ExpenseCalculationsModalProps {
  open: boolean
  onClose: () => void
}

export function ExpenseCalculationsModal({ open, onClose }: ExpenseCalculationsModalProps) {
  const { entries } = useEntries()

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)

  useEffect(() => {
    if (open) {
      const today = new Date()
      setViewYear(today.getFullYear())
      setSelectedMonth(today.getMonth() + 1)
    }
  }, [open])

  const expenseEntries = useMemo(
    () => entries.filter((entry): entry is ExpenseEntry => entry.category === 'expenses'),
    [entries],
  )

  const monthlyTotals = useMemo(
    () => getMonthlyTotalsForYear(expenseEntries, viewYear),
    [expenseEntries, viewYear],
  )

  const selectedMonthTotal = useMemo(
    () => getMonthExpenseTotal(expenseEntries, viewYear, selectedMonth),
    [expenseEntries, viewYear, selectedMonth],
  )

  const selectedMonthEntries = useMemo(
    () => getExpensesForMonth(expenseEntries, viewYear, selectedMonth),
    [expenseEntries, viewYear, selectedMonth],
  )

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setViewYear((year) => year - 1)
      setSelectedMonth(12)
      return
    }
    setSelectedMonth((month) => month - 1)
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setViewYear((year) => year + 1)
      setSelectedMonth(1)
      return
    }
    setSelectedMonth((month) => month + 1)
  }

  const goToPrevYear = () => {
    setViewYear((year) => year - 1)
  }

  const goToNextYear = () => {
    setViewYear((year) => year + 1)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close calculations"
        className="modal-backdrop"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="panel max-h-[min(90dvh,720px)] overflow-y-auto p-5 shadow-[var(--shadow-elevated)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink dark:text-zinc-100">
              Calculations
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink dark:hover:bg-dark-panel dark:hover:text-zinc-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPrevYear}
              className="btn-icon h-8 w-8"
              aria-label="Previous year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-ink dark:text-zinc-100">{viewYear}</p>
            <button
              type="button"
              onClick={goToNextYear}
              className="btn-icon h-8 w-8"
              aria-label="Next year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="btn-icon h-8 w-8"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="text-sm font-medium text-ink dark:text-zinc-100">
              {formatMonthYear(viewYear, selectedMonth)}
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="btn-icon h-8 w-8"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-border/70 bg-surface-muted/50 p-3 dark:border-dark-border/70 dark:bg-dark-panel/50">
            <ExpenseMonthlyGraph
              monthlyTotals={monthlyTotals}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          </div>

          <div className="rounded-2xl border border-sage-300/40 bg-sage-100 px-4 py-4 dark:border-sage-500/20 dark:bg-sage-500/10">
            <p className="text-xs font-medium uppercase tracking-wide text-sage-500 dark:text-sage-300">
              Total expenses
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-ink dark:text-zinc-100">
              {formatExpenseCurrency(selectedMonthTotal)}
            </p>
            <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
              {selectedMonthEntries.length === 0
                ? 'No expense entries this month'
                : `${selectedMonthEntries.length} expense ${
                    selectedMonthEntries.length === 1 ? 'entry' : 'entries'
                  }`}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
