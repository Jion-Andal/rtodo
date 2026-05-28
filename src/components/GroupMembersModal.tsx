import { useEffect, useMemo, useState } from 'react'
import { Modal } from './Modal'
import {
  buildGroupInviteUrl,
  fetchGroupMembers,
  type GroupMember,
} from '../services/rtodoGroupsSupabase'
import { copyTextToClipboard } from '../utils/clipboard'
import { getErrorMessage } from '../utils/errorMessage'

interface GroupMembersModalProps {
  open: boolean
  groupId: string
  groupName: string
  inviteCode: string
  onClose: () => void
}

export function GroupMembersModal({
  open,
  groupId,
  groupName,
  inviteCode,
  onClose,
}: GroupMembersModalProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const inviteUrl = useMemo(() => buildGroupInviteUrl(inviteCode), [inviteCode])

  useEffect(() => {
    if (!open) return

    setLoading(true)
    setError(null)
    setCopied(false)
    setCopyError(null)
    fetchGroupMembers(groupId)
      .then(setMembers)
      .catch((err) => {
        setMembers([])
        setError(getErrorMessage(err, 'Could not load members.'))
      })
      .finally(() => setLoading(false))
  }, [open, groupId])

  const handleCopyLink = async () => {
    setCopyError(null)
    try {
      const ok = await copyTextToClipboard(inviteUrl)
      if (!ok) throw new Error('copy failed')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('Could not copy link. Select and copy it manually.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Members · ${groupName}`}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-ink-muted dark:text-ink-faint">
            Share this link so others can join the group.
          </p>
          <div className="panel-inset p-3 text-xs break-all text-ink dark:text-zinc-300">
            {inviteUrl}
          </div>
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className="btn-primary mt-2 w-full"
          >
            {copied ? 'Copied!' : 'Copy invite link'}
          </button>
          {copyError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
              {copyError}
            </p>
          )}
        </div>

        <div className="border-t border-border pt-4 dark:border-dark-border">
          <h3 className="mb-2 text-sm font-medium text-ink dark:text-zinc-200">Current members</h3>
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-muted dark:text-ink-faint">
              Loading members…
            </p>
          ) : error && members.length === 0 ? (
            <p className="py-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : members.length === 0 ? (
            <p className="py-2 text-sm text-ink-muted dark:text-ink-faint">No members found.</p>
          ) : (
            <>
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {members.map((member) => (
                  <li
                    key={member.userId}
                    className="panel flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink dark:text-zinc-100">
                        {member.displayName || member.username}
                      </p>
                      {member.displayName && member.displayName !== member.username && (
                        <p className="truncate text-xs text-ink-muted dark:text-ink-faint">
                          @{member.username}
                        </p>
                      )}
                    </div>
                    {member.isOwner && (
                      <span className="shrink-0 rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted dark:border-dark-border dark:bg-dark-panel dark:text-zinc-400">
                        Owner
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-ink-muted dark:text-ink-faint">
                {members.length} member{members.length === 1 ? '' : 's'}
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
