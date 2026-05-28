import { useState } from 'react'
import { Modal } from './Modal'
import { inputClassName, buttonPrimaryClassName, buttonSecondaryClassName } from './forms/FormField'
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
          <div className="panel-inset p-3 text-xs break-all text-ink dark:text-zinc-300">
            {inviteUrl}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="btn-primary flex-1"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className={buttonSecondaryClassName}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="mb-1 block text-sm font-medium text-ink dark:text-zinc-200">
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
              className={inputClassName}
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
            className={buttonPrimaryClassName}
          >
            {creating ? 'Creating…' : 'Create group'}
          </button>
        </form>
      )}
    </Modal>
  )
}
