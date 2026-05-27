import { useState } from 'react'
import { Modal } from './Modal'
import { useGroups } from '../context/GroupsContext'
import { copyTextToClipboard } from '../utils/clipboard'
import { getErrorMessage } from '../utils/errorMessage'

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const { createNewGroup, creating } = useGroups()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setName('')
    setError(null)
    setInviteUrl(null)
    setCopied(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a group name.')
      return
    }

    try {
      const result = await createNewGroup(trimmed)
      setInviteUrl(result.inviteUrl)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Could not create group. If this keeps happening, run supabase/groups-fix.sql in the SQL Editor.',
        ),
      )
    }
  }

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      const ok = await copyTextToClipboard(inviteUrl)
      if (!ok) throw new Error('copy failed')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy link. Select and copy it manually.')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={inviteUrl ? 'Group created' : 'Create group'}>
      {inviteUrl ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted dark:text-ink-faint">
            Share this link so others can join and share entries with you.
          </p>
          <div className="rounded-xl border border-border bg-mint-50/80 p-3 text-xs break-all text-ink dark:border-border-strong dark:bg-mint-600/10 dark:text-mint-100">
            {inviteUrl}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex-1 rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-medium text-white hover:bg-mint-500 dark:bg-mint-500 dark:hover:bg-mint-600"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-mint-100 dark:border-border-strong dark:text-mint-100 dark:hover:bg-mint-600/20"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="mb-1 block text-sm font-medium text-ink dark:text-mint-100">
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roommates"
              maxLength={80}
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-mint-400 dark:border-border-strong dark:bg-[#243038] dark:text-mint-50"
            />
            <p className="mt-1 text-xs text-ink-muted dark:text-ink-faint">
              Must be unique among your groups.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-mint-500 disabled:opacity-60 dark:bg-mint-500 dark:hover:bg-mint-600"
          >
            {creating ? 'Creating…' : 'Create group'}
          </button>
        </form>
      )}
    </Modal>
  )
}
