import { useCallback, useEffect, useRef, useState } from 'react'

const ADD_LONG_PRESS_MS = 3000

const ADD_EASTER_EGG_MESSAGES = [
  'No rush',
  'Still thinking e?',
  'Take your time',
  'I can do this all day',
  'Dit me may',
] as const
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../context/EntriesContext'
import { useGroups } from '../context/GroupsContext'
import type { Category, Entry } from '../types'
import { CATEGORY_LABELS, CATEGORY_SINGULAR } from '../types'
import { ItemCard } from './ItemCard'
import { Modal } from './Modal'
import { ConfirmModal } from './ConfirmModal'
import { ChecklistItemsModal } from './ChecklistItemsModal'
import { ChecklistForm } from './forms/ChecklistForm'
import { NoteForm } from './forms/NoteForm'
import { EventForm } from './forms/EventForm'
import { ExpenseForm } from './forms/ExpenseForm'
import { GroupMembersModal } from './GroupMembersModal'

interface CategoryViewProps {
  category: Category
  showCompleted: boolean
  onToggleCompleted: () => void
}

function EntryForm({
  category,
  entry,
  onSuccess,
}: {
  category: Category
  entry?: Entry
  onSuccess: () => void
}) {
  switch (category) {
    case 'checklist':
      return (
        <ChecklistForm
          entry={entry?.category === 'checklist' ? entry : undefined}
          onSuccess={onSuccess}
        />
      )
    case 'notes':
      return (
        <NoteForm
          entry={entry?.category === 'notes' ? entry : undefined}
          onSuccess={onSuccess}
        />
      )
    case 'events':
      return (
        <EventForm
          entry={entry?.category === 'events' ? entry : undefined}
          onSuccess={onSuccess}
        />
      )
    case 'expenses':
      return (
        <ExpenseForm
          entry={entry?.category === 'expenses' ? entry : undefined}
          onSuccess={onSuccess}
        />
      )
  }
}

export function CategoryView({ category, showCompleted, onToggleCompleted }: CategoryViewProps) {
  const { username } = useAuth()
  const { activeGroupId, activeGroupName, groups } = useGroups()
  const activeGroup = groups.find((g) => g.id === activeGroupId)
  const { getByCategory, toggleCompleted, deleteEntry, loading } = useEntries()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [confirmEntry, setConfirmEntry] = useState<Entry | null>(null)
  const [deleteEntryTarget, setDeleteEntryTarget] = useState<Entry | null>(null)
  const [checklistEntryId, setChecklistEntryId] = useState<string | null>(null)
  const [addEasterEggMessage, setAddEasterEggMessage] = useState<string | null>(null)
  const addLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addLongPressFired = useRef(false)
  const addEasterEggTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAddLongPress = useCallback(() => {
    if (addLongPressTimer.current) {
      clearTimeout(addLongPressTimer.current)
      addLongPressTimer.current = null
    }
  }, [])

  const dismissAddEasterEgg = useCallback(() => {
    setAddEasterEggMessage(null)
    if (addEasterEggTimer.current) {
      clearTimeout(addEasterEggTimer.current)
      addEasterEggTimer.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearAddLongPress()
      if (addEasterEggTimer.current) clearTimeout(addEasterEggTimer.current)
    }
  }, [clearAddLongPress])

  const handleAddPointerDown = () => {
    clearAddLongPress()
    addLongPressFired.current = false
    addLongPressTimer.current = setTimeout(() => {
      addLongPressFired.current = true
      const message =
        ADD_EASTER_EGG_MESSAGES[
          Math.floor(Math.random() * ADD_EASTER_EGG_MESSAGES.length)
        ]
      setAddEasterEggMessage(message)
      if (addEasterEggTimer.current) clearTimeout(addEasterEggTimer.current)
      addEasterEggTimer.current = setTimeout(() => dismissAddEasterEgg(), 3200)
    }, ADD_LONG_PRESS_MS)
  }

  const handleAddPointerUp = () => {
    clearAddLongPress()
  }

  const handleAddClick = () => {
    if (addLongPressFired.current) {
      addLongPressFired.current = false
      return
    }
    setShowAddModal(true)
  }

  const entries = getByCategory(category, showCompleted)

  const handleConfirmComplete = () => {
    if (confirmEntry) {
      toggleCompleted(confirmEntry.id)
      setConfirmEntry(null)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteEntryTarget) {
      deleteEntry(deleteEntryTarget.id)
      setDeleteEntryTarget(null)
    }
  }

  const confirmMessage = confirmEntry?.completed
    ? 'Do you want to mark this item as active again?'
    : 'Do you want to mark this item as completed?'

  const confirmTitle = confirmEntry?.completed
    ? 'Mark as active?'
    : 'Mark as completed?'

  const confirmLabel = confirmEntry?.completed ? 'Mark active' : 'Mark completed'

  if (loading) {
    return (
      <section>
        <p className="py-12 text-center text-sm text-ink-muted dark:text-ink-faint">
          Loading entries…
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 lg:mb-6">
        {username && (
          <div className="mb-2 flex items-center justify-between gap-2 lg:mb-3">
            <p className="text-sm text-ink-muted dark:text-zinc-400">
              Hi, <span className="font-medium text-ink dark:text-zinc-100">{username}</span>
            </p>
            {activeGroupId && (
              <button
                type="button"
                onClick={() => setShowMembersModal(true)}
                className="chip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 8a2 2 0 11-4 0 2 2 0 014 0zM5.555 14.286A4.977 4.977 0 0110 12.5c1.69 0 3.185.84 4.09 2.126a.75.75 0 01-1.298.756A3.477 3.477 0 0010 14c-1.23 0-2.316.633-2.947 1.618a.75.75 0 11-1.298-.756A4.977 4.977 0 015.555 14.286z" />
                </svg>
                Members
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <h2 className="section-title lg:text-xl">
              {CATEGORY_LABELS[category]}
            </h2>

            <p className="section-meta lg:text-sm">
              {showCompleted ? 'Completed items' : 'Active items'} · {entries.length}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onToggleCompleted}
              aria-pressed={showCompleted}
              className={`btn-compact ${
                showCompleted
                  ? 'btn-primary'
                  : 'border border-border/80 bg-surface/90 text-ink shadow-sm hover:border-border-strong hover:bg-surface dark:border-dark-border/80 dark:bg-dark-elevated/90 dark:text-zinc-200 dark:hover:bg-dark-elevated'
              }`}
            >
              {showCompleted ? 'Show active' : 'Show history'}
            </button>

            {!showCompleted && (
              <button
                type="button"
                onClick={handleAddClick}
                onPointerDown={handleAddPointerDown}
                onPointerUp={handleAddPointerUp}
                onPointerLeave={handleAddPointerUp}
                onPointerCancel={handleAddPointerUp}
                onContextMenu={(e) => e.preventDefault()}
                className="btn-compact btn-primary touch-manipulation select-none"
              >
                Add item
              </button>
            )}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="panel-inset px-6 py-12 text-center">
          <p className="text-sm text-ink-muted dark:text-ink-faint">
            {showCompleted
              ? `No completed ${CATEGORY_LABELS[category].toLowerCase()} yet.`
              : `No ${CATEGORY_LABELS[category].toLowerCase()} yet. Use Add item to create one.`}
          </p>
        </div>
      ) : (
        <ul className="entry-grid">
          {entries.map((entry) => (
            <li key={entry.id}>
              <ItemCard
                entry={entry}
                onCheckboxClick={setConfirmEntry}
                onEdit={setEditingEntry}
                onDelete={setDeleteEntryTarget}
                onChecklistClick={
                  category === 'checklist'
                    ? (checklist) => setChecklistEntryId(checklist.id)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {activeGroupId && activeGroup && (
        <GroupMembersModal
          open={showMembersModal}
          groupId={activeGroupId}
          groupName={activeGroupName}
          inviteCode={activeGroup.inviteCode}
          onClose={() => setShowMembersModal(false)}
        />
      )}

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${CATEGORY_SINGULAR[category]}`}
      >
        <EntryForm category={category} onSuccess={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        open={editingEntry !== null}
        onClose={() => setEditingEntry(null)}
        title={`Edit ${CATEGORY_SINGULAR[category]}`}
      >
        {editingEntry && (
          <EntryForm
            category={category}
            entry={editingEntry}
            onSuccess={() => setEditingEntry(null)}
          />
        )}
      </Modal>

      <ChecklistItemsModal
        entryId={checklistEntryId}
        onClose={() => setChecklistEntryId(null)}
      />

      <ConfirmModal
        open={confirmEntry !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirmComplete}
        onCancel={() => setConfirmEntry(null)}
      />

      <ConfirmModal
        open={deleteEntryTarget !== null}
        title="Delete entry?"
        message={`Are you sure you want to delete "${deleteEntryTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteEntryTarget(null)}
      />

      {addEasterEggMessage && (
        <div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center px-6"
          onClick={dismissAddEasterEgg}
          role="presentation"
        >
          <div className="easter-egg-backdrop absolute inset-0" aria-hidden="true" />
          <p
            role="status"
            className="animate-easter-egg-fade-in panel relative z-10 select-none px-8 py-5 text-center text-2xl font-bold tracking-tight text-ink dark:text-zinc-100 sm:text-3xl"
          >
            {addEasterEggMessage}
          </p>
        </div>
      )}
    </section>
  )
}
