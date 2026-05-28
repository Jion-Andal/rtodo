import { useEffect, useRef, useState } from 'react'
import { useGroups, PERSONAL_GROUP_LABEL } from '../context/GroupsContext'
import type { RtodoGroup } from '../services/rtodoGroupsSupabase'
import { CreateGroupModal } from './CreateGroupModal'
import { ConfirmModal } from './ConfirmModal'
import { getErrorMessage } from '../utils/errorMessage'

interface GroupSelectorProps {
  showCompleted?: boolean
}

type ConfirmAction = 'delete' | 'leave'

export function GroupSelector({ showCompleted: _showCompleted = false }: GroupSelectorProps) {
  const {
    groups,
    activeGroupId,
    activeGroupName,
    loading,
    joining,
    removing,
    selectGroup,
    deleteGroupById,
    leaveGroupById,
  } = useGroups()
  const [open, setOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [confirmGroup, setConfirmGroup] = useState<{
    group: RtodoGroup
    action: ConfirmAction
  } | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const buttonClass = 'chip max-w-[7rem] sm:max-w-[8.5rem]'

  const label = joining ? 'Joining…' : loading ? '…' : activeGroupName

  const openRemoveConfirm = (group: RtodoGroup, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmError(null)
    setConfirmGroup({ group, action: group.isOwner ? 'delete' : 'leave' })
    setOpen(false)
  }

  const handleConfirmRemove = async () => {
    if (!confirmGroup) return
    setConfirmError(null)
    try {
      if (confirmGroup.action === 'delete') {
        await deleteGroupById(confirmGroup.group.id)
      } else {
        await leaveGroupById(confirmGroup.group.id)
      }
      setConfirmGroup(null)
    } catch (err) {
      setConfirmError(getErrorMessage(err, 'Something went wrong. Please try again.'))
    }
  }

  const confirmTitle =
    confirmGroup?.action === 'delete' ? 'Delete group?' : 'Leave group?'

  const confirmMessage =
    confirmGroup?.action === 'delete'
      ? `Delete "${confirmGroup.group.name}"? All members will lose access and shared entries will be permanently removed.`
      : `Leave "${confirmGroup?.group.name}"? You will lose access to this group's shared entries.`

  const confirmLabel = confirmGroup?.action === 'delete' ? 'Delete group' : 'Leave group'

  return (
    <>
      <div ref={containerRef} className="relative min-w-0">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Current group: ${label}`}
          title={label}
          disabled={loading || joining}
          className={`flex min-w-0 items-center gap-1 ${buttonClass}`}
        >
          <span className="min-w-0 truncate">{label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Select group"
            className="absolute right-0 top-full z-30 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-border bg-surface py-1 shadow-lg dark:border-dark-border dark:bg-dark-elevated"
          >
            <button
              type="button"
              role="option"
              aria-selected={activeGroupId === null}
              onClick={() => {
                void selectGroup(null)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-surface-muted dark:hover:bg-dark-panel ${
                activeGroupId === null
                  ? 'font-medium text-mint-600 dark:text-mint-400'
                  : 'text-ink dark:text-zinc-300'
              }`}
            >
              {PERSONAL_GROUP_LABEL}
            </button>

            {groups.map((group) => (
              <div
                key={group.id}
                role="option"
                aria-selected={activeGroupId === group.id}
                className={`flex items-center gap-0.5 transition-colors hover:bg-surface-muted dark:hover:bg-dark-panel ${
                  activeGroupId === group.id ? 'bg-surface-muted/80 dark:bg-dark-panel/80' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    void selectGroup(group.id)
                    setOpen(false)
                  }}
                  className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-xs ${
                    activeGroupId === group.id
                      ? 'font-medium text-mint-600 dark:text-mint-400'
                      : 'text-ink dark:text-zinc-300'
                  }`}
                >
                  {group.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => openRemoveConfirm(group, e)}
                  aria-label={
                    group.isOwner
                      ? `Delete group ${group.name}`
                      : `Leave group ${group.name}`
                  }
                  className="mr-1.5 shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink dark:hover:bg-dark-panel dark:hover:text-zinc-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="my-1 border-t border-border dark:border-dark-border" />

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setShowCreateModal(true)
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-mint-600 hover:bg-surface-muted dark:text-mint-400 dark:hover:bg-dark-panel"
            >
              Create group…
            </button>
          </div>
        )}
      </div>

      <CreateGroupModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <ConfirmModal
        open={confirmGroup !== null}
        title={confirmTitle}
        message={confirmError ?? confirmMessage}
        confirmLabel={removing ? 'Please wait…' : confirmLabel}
        confirmDisabled={removing}
        onConfirm={() => void handleConfirmRemove()}
        onCancel={() => {
          setConfirmGroup(null)
          setConfirmError(null)
        }}
      />
    </>
  )
}
