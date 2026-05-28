import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmDisabled?: boolean
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        className="modal-backdrop"
        onClick={onCancel}
      />
      <div className="panel relative z-10 w-full max-w-sm p-6 shadow-[var(--shadow-elevated)]">
        <h2 className={`text-lg font-semibold tracking-tight ${danger ? 'text-peach-400' : 'text-ink dark:text-zinc-100'}`}>
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted dark:text-zinc-400">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
              danger
                ? 'bg-peach-400 hover:bg-peach-300'
                : 'bg-mint-600 hover:bg-mint-500 dark:bg-mint-500 dark:hover:bg-mint-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
