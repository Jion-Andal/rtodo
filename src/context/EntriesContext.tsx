import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { useGroups } from './GroupsContext'
import type { Category, Entry } from '../types'
import {
  deleteEntryById,
  loadEntriesWithLocalMigration,
  upsertEntry,
} from '../services/rtodoEntriesSupabase'
import { supabase } from '../lib/supabase'

interface EntriesContextValue {
  entries: Entry[]
  loading: boolean
  hasRemoteChanges: boolean
  refreshing: boolean
  refreshEntries: () => Promise<void>
  addEntry: (entry: Entry) => void
  updateEntry: (entry: Entry) => void
  deleteEntry: (id: string) => void
  toggleCompleted: (id: string) => void
  toggleChecklistItem: (entryId: string, itemId: string) => void
  getByCategory: (category: Category, showCompleted: boolean) => Entry[]
}

const LOCAL_MUTATION_GRACE_MS = 2000

const EntriesContext = createContext<EntriesContextValue | null>(null)

export function EntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { activeGroupId, loading: groupsLoading } = useGroups()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [hasRemoteChanges, setHasRemoteChanges] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const localWriteUntilRef = useRef(0)

  const markLocalMutation = useCallback(() => {
    localWriteUntilRef.current = Date.now() + LOCAL_MUTATION_GRACE_MS
  }, [])

  const reloadEntries = useCallback(async () => {
    if (!user) {
      setEntries([])
      return
    }

    try {
      const data = await loadEntriesWithLocalMigration(user.id, activeGroupId)
      setEntries(data)
    } catch (err) {
      console.error('Failed to load entries:', err)
    }
  }, [user, activeGroupId])

  const refreshEntries = useCallback(async () => {
    setRefreshing(true)
    try {
      await reloadEntries()
      setHasRemoteChanges(false)
    } finally {
      setRefreshing(false)
    }
  }, [reloadEntries])

  const handleRemoteChange = useCallback(() => {
    if (Date.now() < localWriteUntilRef.current) {
      void reloadEntries()
      return
    }
    setHasRemoteChanges(true)
  }, [reloadEntries])

  useEffect(() => {
    setHasRemoteChanges(false)
    localWriteUntilRef.current = 0
  }, [activeGroupId])

  useEffect(() => {
    if (!user) return

    const params = new URLSearchParams(window.location.search)
    if (!params.has('previewSyncBanner')) return

    setHasRemoteChanges(true)
    params.delete('previewSyncBanner')
    const query = params.toString()
    const next = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
    window.history.replaceState(null, '', next)
  }, [user])

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    if (groupsLoading) return

    setLoading(true)
    reloadEntries().finally(() => setLoading(false))
  }, [user, activeGroupId, groupsLoading, reloadEntries])

  useEffect(() => {
    const client = supabase
    if (!client || !user || groupsLoading) return

    const filter =
      activeGroupId === null
        ? 'group_id=is.null'
        : `group_id=eq.${activeGroupId}`

    const channel = client
      .channel(`rtodo-entries-${activeGroupId ?? 'personal'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rtodo_entries',
          filter,
        },
        () => {
          handleRemoteChange()
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Entries realtime subscription error:', err)
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Entries realtime channel error')
        }
      })

    return () => {
      void client.removeChannel(channel)
    }
  }, [user, activeGroupId, groupsLoading, handleRemoteChange])

  const persistEntry = useCallback(
    async (entry: Entry) => {
      if (!user) return
      markLocalMutation()
      try {
        await upsertEntry(entry, user.id, activeGroupId)
      } catch (err) {
        console.error('Failed to save entry:', err)
        await reloadEntries()
      }
    },
    [user, activeGroupId, reloadEntries, markLocalMutation],
  )

  const persistDelete = useCallback(
    async (id: string) => {
      markLocalMutation()
      try {
        await deleteEntryById(id)
      } catch (err) {
        console.error('Failed to delete entry:', err)
        await reloadEntries()
      }
    },
    [reloadEntries, markLocalMutation],
  )

  const addEntry = (entry: Entry) => {
    setEntries((prev) => [entry, ...prev])
    void persistEntry(entry)
  }

  const updateEntry = (entry: Entry) => {
    setEntries((prev) =>
      prev.map((existing) => (existing.id === entry.id ? entry : existing)),
    )
    void persistEntry(entry)
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    void persistDelete(id)
  }

  const toggleCompleted = (id: string) => {
    setEntries((prev) => {
      const next = prev.map((entry) =>
        entry.id === id ? { ...entry, completed: !entry.completed } : entry,
      )
      const updated = next.find((entry) => entry.id === id)
      if (updated) void persistEntry(updated)
      return next
    })
  }

  const toggleChecklistItem = (entryId: string, itemId: string) => {
    setEntries((prev) => {
      const next = prev.map((entry) => {
        if (entry.id !== entryId || entry.category !== 'checklist') return entry
        return {
          ...entry,
          items: entry.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item,
          ),
        }
      })
      const updated = next.find((entry) => entry.id === entryId)
      if (updated) void persistEntry(updated)
      return next
    })
  }

  const getByCategory = (category: Category, showCompleted: boolean) => {
    return entries.filter(
      (entry) =>
        entry.category === category &&
        (showCompleted ? entry.completed : !entry.completed),
    )
  }

  return (
    <EntriesContext.Provider
      value={{
        entries,
        loading,
        hasRemoteChanges,
        refreshing,
        refreshEntries,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleCompleted,
        toggleChecklistItem,
        getByCategory,
      }}
    >
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntries must be used within EntriesProvider')
  }
  return context
}
