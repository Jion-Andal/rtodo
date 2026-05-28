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
      className="border-b border-mint-200/80 bg-mint-50/90 px-4 py-3 backdrop-blur-sm dark:border-mint-500/20 dark:bg-mint-500/10"
    >
      <div className="content-shell flex items-center justify-between gap-3">
        <p className="text-sm text-ink dark:text-zinc-200">{message}</p>
        <button
          type="button"
          onClick={() => void refreshEntries()}
          disabled={refreshing}
          className="shrink-0 rounded-md bg-mint-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-mint-500 disabled:opacity-60 dark:bg-mint-500 dark:hover:bg-mint-400"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
