import { useEntries } from '../context/EntriesContext'
import { useGroups } from '../context/GroupsContext'

export function RemoteChangesBanner() {
  const { activeGroupId } = useGroups()
  const { hasRemoteChanges, refreshing, refreshEntries } = useEntries()

  if (!hasRemoteChanges) return null

  const message = activeGroupId
    ? 'Other members made changes. Refresh to see the latest updates.'
    : 'There are newer changes. Refresh to see the latest updates.'

  return (
    <div
      role="status"
      className="border-b border-mint-300 bg-mint-100 px-4 py-3 dark:border-mint-500/40 dark:bg-mint-600/20"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-sm text-ink dark:text-mint-50">{message}</p>
        <button
          type="button"
          onClick={() => void refreshEntries()}
          disabled={refreshing}
          className="shrink-0 rounded-lg bg-mint-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-mint-600 disabled:opacity-60 dark:bg-mint-600 dark:hover:bg-mint-500"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
