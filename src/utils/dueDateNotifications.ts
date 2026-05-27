import { assetUrl } from '../lib/assetUrl'
import type { Entry } from '../types'

const NOTIFIED_STORAGE_KEY = 'rtodo-due-notified'

export interface DueTodayEntry {
  id: string
  title: string
  category: 'checklist' | 'notes'
}

export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getNotificationKey(entryId: string, date: string): string {
  return `${entryId}::${date}`
}

function getDateFromKey(key: string): string {
  return key.split('::')[1] ?? ''
}

function loadNotifiedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function saveNotifiedKeys(keys: Set<string>) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = [
    cutoff.getFullYear(),
    String(cutoff.getMonth() + 1).padStart(2, '0'),
    String(cutoff.getDate()).padStart(2, '0'),
  ].join('-')

  const pruned = [...keys].filter((key) => getDateFromKey(key) >= cutoffStr)
  localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(pruned))
}

export function markEntryNotified(entryId: string, date: string) {
  const keys = loadNotifiedKeys()
  keys.add(getNotificationKey(entryId, date))
  saveNotifiedKeys(keys)
}

export function markEntriesNotified(entries: DueTodayEntry[], date: string) {
  const keys = loadNotifiedKeys()
  for (const entry of entries) {
    keys.add(getNotificationKey(entry.id, date))
  }
  saveNotifiedKeys(keys)
}

export function getDueTodayEntries(entries: Entry[]): DueTodayEntry[] {
  const today = getTodayDateString()
  const notified = loadNotifiedKeys()

  return entries
    .filter((entry): entry is Entry & { category: 'checklist' | 'notes' } => {
      if (entry.completed) return false
      if (entry.category !== 'checklist' && entry.category !== 'notes') return false
      if (!entry.dueDate || entry.dueDate !== today) return false
      return !notified.has(getNotificationKey(entry.id, today))
    })
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      category: entry.category,
    }))
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export function showDueDateNotification(entry: DueTodayEntry) {
  const label = entry.category === 'checklist' ? 'Checklist' : 'Note'
  new Notification('RTodo — Due today', {
    body: `${label}: ${entry.title}`,
    icon: new URL(assetUrl('favicon.svg'), window.location.href).href,
    tag: getNotificationKey(entry.id, getTodayDateString()),
  })
}

export async function notifyDueTodayEntries(entries: DueTodayEntry[]): Promise<'notified' | 'fallback'> {
  if (entries.length === 0) return 'notified'

  const permission = await requestNotificationPermission()

  if (permission === 'granted') {
    const today = getTodayDateString()
    for (const entry of entries) {
      showDueDateNotification(entry)
      markEntryNotified(entry.id, today)
    }
    return 'notified'
  }

  return 'fallback'
}
