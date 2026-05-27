import { supabase } from '../lib/supabase'
import type { Entry } from '../types'

const LOCAL_STORAGE_KEY = 'rtodo-entries'

interface DbRtodoEntryRow {
  id: string
  user_id: string | null
  group_id: string | null
  data: Entry
  updated_at: string
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function rowToEntry(row: DbRtodoEntryRow): Entry {
  return { ...row.data, id: row.id }
}

function entriesQuery(groupId: string | null) {
  const client = requireClient()
  let query = client.from('rtodo_entries').select('id, data, updated_at, group_id')

  if (groupId === null) {
    query = query.is('group_id', null)
  } else {
    query = query.eq('group_id', groupId)
  }

  return query.order('updated_at', { ascending: false })
}

export async function fetchEntriesForGroup(groupId: string | null): Promise<Entry[]> {
  const { data, error } = await entriesQuery(groupId)
  if (error) throw error
  return (data as DbRtodoEntryRow[]).map(rowToEntry)
}

export async function upsertEntry(
  entry: Entry,
  userId: string,
  groupId: string | null,
): Promise<void> {
  const client = requireClient()

  const { error } = await client.from('rtodo_entries').upsert({
    id: entry.id,
    user_id: userId,
    group_id: groupId,
    data: entry,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function upsertEntries(
  entries: Entry[],
  userId: string,
  groupId: string | null,
): Promise<void> {
  if (entries.length === 0) return

  const client = requireClient()
  const now = new Date().toISOString()

  const { error } = await client.from('rtodo_entries').upsert(
    entries.map((entry) => ({
      id: entry.id,
      user_id: userId,
      group_id: groupId,
      data: entry,
      updated_at: now,
    })),
  )

  if (error) throw error
}

export async function deleteEntryById(id: string): Promise<void> {
  const client = requireClient()

  const { error } = await client.from('rtodo_entries').delete().eq('id', id)
  if (error) throw error
}

function readLocalEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Entry[]) : []
  } catch {
    return []
  }
}

export async function loadEntriesWithLocalMigration(
  userId: string,
  groupId: string | null,
): Promise<Entry[]> {
  const remote = await fetchEntriesForGroup(groupId)
  if (remote.length > 0 || groupId !== null) return remote

  const local = readLocalEntries()
  if (local.length === 0) return []

  await upsertEntries(local, userId, null)
  localStorage.removeItem(LOCAL_STORAGE_KEY)
  return fetchEntriesForGroup(null)
}
