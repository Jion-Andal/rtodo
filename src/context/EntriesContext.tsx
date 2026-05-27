import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  addEntry: (entry: Entry) => void
  updateEntry: (entry: Entry) => void
  deleteEntry: (id: string) => void
  toggleCompleted: (id: string) => void
  toggleChecklistItem: (entryId: string, itemId: string) => void
  getByCategory: (category: Category, showCompleted: boolean) => Entry[]
}

const EntriesContext = createContext<EntriesContextValue | null>(null)

export function EntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { activeGroupId, loading: groupsLoading } = useGroups()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

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
          void reloadEntries()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [user, activeGroupId, groupsLoading, reloadEntries])

  const persistEntry = useCallback(
    async (entry: Entry) => {
      if (!user) return
      try {
        await upsertEntry(entry, user.id, activeGroupId)
      } catch (err) {
        console.error('Failed to save entry:', err)
        await reloadEntries()
      }
    },
    [user, activeGroupId, reloadEntries],
  )

  const persistDelete = useCallback(
    async (id: string) => {
      try {
        await deleteEntryById(id)
      } catch (err) {
        console.error('Failed to delete entry:', err)
        await reloadEntries()
      }
    },
    [reloadEntries],
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
