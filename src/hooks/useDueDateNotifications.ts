import { useCallback, useEffect, useState } from 'react'
import { useEntries } from '../context/EntriesContext'
import {
  getDueTodayEntries,
  getTodayDateString,
  markEntriesNotified,
  notifyDueTodayEntries,
  type DueTodayEntry,
} from '../utils/dueDateNotifications'

export function useDueDateNotifications() {
  const { entries } = useEntries()
  const [inAppAlerts, setInAppAlerts] = useState<DueTodayEntry[]>([])

  const checkDueDates = useCallback(async () => {
    const dueToday = getDueTodayEntries(entries)
    if (dueToday.length === 0) {
      setInAppAlerts([])
      return
    }

    const result = await notifyDueTodayEntries(dueToday)
    if (result === 'fallback') {
      setInAppAlerts(dueToday)
    } else {
      setInAppAlerts([])
    }
  }, [entries])

  useEffect(() => {
    void checkDueDates()
  }, [checkDueDates])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void checkDueDates()
    }, 60_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void checkDueDates()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [checkDueDates])

  const dismissInAppAlerts = useCallback(() => {
    if (inAppAlerts.length === 0) return
    markEntriesNotified(inAppAlerts, getTodayDateString())
    setInAppAlerts([])
  }, [inAppAlerts])

  return { inAppAlerts, dismissInAppAlerts }
}
