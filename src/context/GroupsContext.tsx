import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  clearJoinQueryFromUrl,
  createGroup,
  deleteGroup,
  fetchActiveGroupId,
  fetchMyGroups,
  getJoinCodeFromUrl,
  joinGroupByInviteCode,
  leaveGroup,
  setActiveGroupId,
  type CreateGroupResult,
  type RtodoGroup,
} from '../services/rtodoGroupsSupabase'
import { getErrorMessage } from '../utils/errorMessage'

export const PERSONAL_GROUP_LABEL = 'Personal'

interface GroupsContextValue {
  groups: RtodoGroup[]
  activeGroupId: string | null
  activeGroupName: string
  loading: boolean
  creating: boolean
  joining: boolean
  removing: boolean
  pendingJoinCode: string | null
  joinError: string | null
  selectGroup: (groupId: string | null) => Promise<void>
  createNewGroup: (name: string) => Promise<CreateGroupResult>
  deleteGroupById: (groupId: string) => Promise<void>
  leaveGroupById: (groupId: string) => Promise<void>
  confirmJoinInvite: () => Promise<void>
  dismissJoinInvite: () => void
  refreshGroups: () => Promise<void>
}

const GroupsContext = createContext<GroupsContextValue | null>(null)

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<RtodoGroup[]>([])
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const refreshGroups = useCallback(async () => {
    if (!user) {
      setGroups([])
      setActiveGroupIdState(null)
      return
    }

    const [myGroups, activeId] = await Promise.all([
      fetchMyGroups(),
      fetchActiveGroupId(),
    ])

    setGroups(myGroups)

    if (activeId && myGroups.some((g) => g.id === activeId)) {
      setActiveGroupIdState(activeId)
    } else if (activeId) {
      await setActiveGroupId(null)
      setActiveGroupIdState(null)
    } else {
      setActiveGroupIdState(null)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setGroups([])
      setActiveGroupIdState(null)
      setPendingJoinCode(null)
      setJoinError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    refreshGroups()
      .catch((err) => console.error('Failed to load groups:', err))
      .finally(() => setLoading(false))
  }, [user, refreshGroups])

  useEffect(() => {
    if (!user || loading) return
    const code = getJoinCodeFromUrl()
    if (code) {
      setPendingJoinCode(code)
      setJoinError(null)
    }
  }, [user, loading])

  const dismissJoinInvite = useCallback(() => {
    setPendingJoinCode(null)
    setJoinError(null)
    clearJoinQueryFromUrl()
  }, [])

  const confirmJoinInvite = useCallback(async () => {
    if (!user || !pendingJoinCode) return

    setJoining(true)
    setJoinError(null)
    try {
      await joinGroupByInviteCode(pendingJoinCode)
      setPendingJoinCode(null)
      clearJoinQueryFromUrl()
      await refreshGroups()
    } catch (err) {
      setJoinError(getErrorMessage(err, 'Could not join group. Check the invite link.'))
    } finally {
      setJoining(false)
    }
  }, [user, pendingJoinCode, refreshGroups])

  const selectGroup = useCallback(
    async (groupId: string | null) => {
      if (!user) return
      if (groupId !== null && !groups.some((g) => g.id === groupId)) return

      try {
        await setActiveGroupId(groupId)
        setActiveGroupIdState(groupId)
      } catch (err) {
        console.error('Failed to switch group:', err)
      }
    },
    [user, groups],
  )

  const removeGroupFromList = useCallback(
    async (groupId: string, action: 'delete' | 'leave') => {
      if (!user) throw new Error('Not authenticated')
      setRemoving(true)
      try {
        if (action === 'delete') {
          await deleteGroup(groupId)
        } else {
          await leaveGroup(groupId)
        }

        if (activeGroupId === groupId) {
          setActiveGroupIdState(null)
        }

        setGroups((prev) => prev.filter((g) => g.id !== groupId))

        try {
          await refreshGroups()
        } catch (refreshErr) {
          console.error('Group removed but list refresh failed:', refreshErr)
        }
      } finally {
        setRemoving(false)
      }
    },
    [user, activeGroupId, refreshGroups],
  )

  const deleteGroupById = useCallback(
    (groupId: string) => removeGroupFromList(groupId, 'delete'),
    [removeGroupFromList],
  )

  const leaveGroupById = useCallback(
    (groupId: string) => removeGroupFromList(groupId, 'leave'),
    [removeGroupFromList],
  )

  const createNewGroup = useCallback(
    async (name: string) => {
      if (!user) throw new Error('Not authenticated')
      setCreating(true)
      try {
        const result = await createGroup(name)
        setActiveGroupIdState(result.group.id)
        try {
          await refreshGroups()
        } catch (refreshErr) {
          console.error('Group created but list refresh failed:', refreshErr)
          setGroups((prev) =>
            prev.some((g) => g.id === result.group.id) ? prev : [...prev, result.group],
          )
        }
        return result
      } finally {
        setCreating(false)
      }
    },
    [user, refreshGroups],
  )

  const activeGroupName = useMemo(() => {
    if (!activeGroupId) return PERSONAL_GROUP_LABEL
    return groups.find((g) => g.id === activeGroupId)?.name ?? PERSONAL_GROUP_LABEL
  }, [activeGroupId, groups])

  return (
    <GroupsContext.Provider
      value={{
        groups,
        activeGroupId,
        activeGroupName,
        loading,
        creating,
        joining,
        removing,
        pendingJoinCode,
        joinError,
        selectGroup,
        createNewGroup,
        deleteGroupById,
        leaveGroupById,
        confirmJoinInvite,
        dismissJoinInvite,
        refreshGroups,
      }}
    >
      {children}
    </GroupsContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupsContext)
  if (!context) {
    throw new Error('useGroups must be used within GroupsProvider')
  }
  return context
}
